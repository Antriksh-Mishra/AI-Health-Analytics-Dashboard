import re
import os
from datetime import datetime

class OCRService:
    def __init__(self):
        self._reader = None

    @property
    def reader(self):
        # Lazy load EasyOCR reader since it imports torch which is heavy
        if self._reader is None:
            import easyocr
            self._reader = easyocr.Reader(['en'], gpu=False)
        return self._reader

    def extract_text(self, file_path):
        """Extracts text from PDF or Image files."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return self._extract_from_pdf(file_path)
        elif ext in ['.png', '.jpg', '.jpeg', '.tiff']:
            return self._extract_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def _extract_from_pdf(self, file_path):
        import pypdf
        text_content = []
        try:
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)
            
            raw_text = "\n".join(text_content).strip()
            # If no text is selectable, try image fallback if pdf2image is available
            if not raw_text:
                # Placeholder for scanned PDF fallback
                pass
            return raw_text
        except Exception as e:
            raise RuntimeError(f"Failed to read PDF: {str(e)}")

    def _extract_from_image(self, file_path):
        try:
            from PIL import Image
            img = Image.open(file_path)
            max_size = 1200
            width, height = img.size
            
            # Downscale large images to speed up EasyOCR CPU processing times
            if width > max_size or height > max_size:
                ratio = min(max_size / width, max_size / height)
                new_size = (int(width * ratio), int(height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                
                temp_path = file_path + ".resized.jpg"
                img.convert("RGB").save(temp_path, "JPEG", quality=85)
                
                results = self.reader.readtext(temp_path, detail=0)
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass
            else:
                results = self.reader.readtext(file_path, detail=0)
                
            return "\n".join(results)
        except Exception as e:
            raise RuntimeError(f"Failed to run OCR on image: {str(e)}")

    def parse_metrics(self, text):
        """Parses core health metrics from raw report text using regex patterns."""
        metrics = {
            'test_date': None,
            'hemoglobin': None,
            'blood_sugar': None,
            'cholesterol': None,
            'vitamin_d': None,
            'systolic_bp': None,
            'diastolic_bp': None,
            'extra_metrics': {}
        }
        
        if not text:
            return metrics

        # Normalize typical OCR noise characters
        clean_text = text.replace('o', '0').replace('O', '0') # Only do this for numeric searches if needed, but let's keep it safe.
        lines = text.split('\n')

        # 1. Parse Date: look for common date regexes, allowing OCR commas/spaces inside the date structure
        date_patterns = [
            r'\b(\d{1,2})[\s,]*[/-]\s*(\d{1,2})\s*[/-]\s*(\d{2,4})\b',  # 12,/05/2026 -> groups: 12, 05, 2026
            r'\b(\d{4})[\s,]*[-/]\s*(\d{2})\s*[-/]\s*(\d{2})\b'        # 2026-05-12
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            if matches:
                match = matches[0]
                try:
                    # Strip any non-digit chars from parsed groups
                    g0 = re.sub(r'\D', '', match[0])
                    g1 = re.sub(r'\D', '', match[1])
                    g2 = re.sub(r'\D', '', match[2])
                    
                    if len(g0) == 4: # YYYY-MM-DD
                        date_str = f"{g0}-{g1}-{g2}"
                        metrics['test_date'] = datetime.strptime(date_str, "%Y-%m-%d")
                    else: # DD/MM/YYYY or MM/DD/YYYY
                        year = g2
                        if len(year) == 2:
                            year = "20" + year
                        date_str = f"{g0}/{g1}/{year}"
                        try:
                            metrics['test_date'] = datetime.strptime(date_str, "%d/%m/%Y")
                        except ValueError:
                            metrics['test_date'] = datetime.strptime(date_str, "%m/%d/%Y")
                    break
                except Exception:
                    pass

        # Helper to extract first float/int from text line after a match (handles stuck units like "148gdL")
        def extract_number(line, pattern, is_hemoglobin=False):
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                # Search for any digits, allowing a dot inside
                num_match = re.search(r'(\d+(?:\.\d+)?)', line[match.end():])
                if num_match:
                    val = float(num_match.group(1))
                    # Heuristic for hemoglobin: if OCR missed decimal dot (e.g. 14.8 -> 148)
                    if is_hemoglobin and 40 <= val <= 250:
                        val = val / 10.0
                    return val
            return None

        # 2. Extract biometric values line-by-line
        for line in lines:
            # Fasting Blood Sugar / Glucose (allow OCR typos like gluccoe, glucse)
            if metrics['blood_sugar'] is None:
                val = extract_number(line, r'\b(?:glucose|fasting sugar|fbs|blood sugar|sugar|gluccoe|glucse|gluc|gluco)\b')
                if val is not None and 30 < val < 500:
                    metrics['blood_sugar'] = val

            # Hemoglobin (allow hb, hgb, hemoglo)
            if metrics['hemoglobin'] is None:
                val = extract_number(line, r'\b(?:hemoglobin|hb|hgb|hemoglo|hemo)\b', is_hemoglobin=True)
                if val is not None and 4 < val < 25:
                    metrics['hemoglobin'] = val

            # Cholesterol (allow total cholesterol, lipids, chol, cholest)
            if metrics['cholesterol'] is None:
                val = extract_number(line, r'\b(?:cholesterol|total cholesterol|lipids|cholest|chol)\b')
                if val is not None and 50 < val < 600:
                    metrics['cholesterol'] = val

            # Vitamin D (allow vit d, 25-oh, calcidiol, and allow typos like 25-OHi)
            if metrics['vitamin_d'] is None:
                val = extract_number(line, r'(?:vitamin\s*d|vit\s*d|25-oh[a-z]*|calcidiol)')
                if val is not None and 1 < val < 200:
                    metrics['vitamin_d'] = val

        # 3. Blood Pressure parsing (e.g. 120/80 or Blood Pressure: 130/85)
        bp_match = re.search(r'\b(\d{2,3})\s*/\s*(\d{2,3})\b', text)
        if bp_match:
            sys_val = int(bp_match.group(1))
            dia_val = int(bp_match.group(2))
            if 70 < sys_val < 220 and 40 < dia_val < 130:
                metrics['systolic_bp'] = sys_val
                metrics['diastolic_bp'] = dia_val
        else:
            # Fallback line-by-line
            for line in lines:
                if 'bp' in line.lower() or 'pressure' in line.lower():
                    nums = re.findall(r'\b\d{2,3}\b', line)
                    if len(nums) >= 2:
                        sys_val = int(nums[0])
                        dia_val = int(nums[1])
                        if 70 < sys_val < 220 and 40 < dia_val < 130:
                            metrics['systolic_bp'] = sys_val
                            metrics['diastolic_bp'] = dia_val
                            break

        return metrics
