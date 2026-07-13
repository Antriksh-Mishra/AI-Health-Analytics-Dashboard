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
            'tsh': None,
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

        # Proximity-based extraction helper that scans lookahead context to handle multi-line OCR layouts
        def find_metric_proximity(keywords, range_check=None, is_hemoglobin=False):
            for kw in keywords:
                matches = list(re.finditer(re.escape(kw), text, re.IGNORECASE))
                for match in matches:
                    start_idx = match.end()
                    lookahead = text[start_idx:start_idx+80]
                    num_matches = re.findall(r'(\d+(?:[.,]\d+)?)', lookahead)
                    for num_str in num_matches:
                        clean_num = num_str.replace(',', '.')
                        try:
                            val = float(clean_num)
                            
                            # Prevent matching D3 in suggestion sentences like "Consider Vitamin D3 supplements"
                            if "D" in kw and val == 3.0 and "d3" in lookahead.lower():
                                continue
                                
                            if is_hemoglobin and 40 <= val <= 250:
                                val = val / 10.0
                                
                            if range_check and not (range_check[0] <= val <= range_check[1]):
                                continue
                                
                            return val
                        except ValueError:
                            continue
            return None

        # 2. Extract biometric values
        metrics['blood_sugar'] = find_metric_proximity(["Fasting Blood Glucose", "Fasting Glucose", "Fasting Blood Sugar", "Glucose"], range_check=(30, 500))
        metrics['hemoglobin'] = find_metric_proximity(["Hemoglobin (Hb)", "Hemoglobin", "Hb", "Hgb"], range_check=(4, 25), is_hemoglobin=True)
        metrics['cholesterol'] = find_metric_proximity(["Cholesterol, Total", "Total Cholesterol", "Cholesterol", "Cholest", "Chol"], range_check=(50, 600))
        metrics['vitamin_d'] = find_metric_proximity(["(25-OH)", "Vitamin D", "Vit D", "25-OH"], range_check=(1, 200))
        metrics['tsh'] = find_metric_proximity(["TSH", "Thyroid Stimulating Hormone", "Thyroid"], range_check=(0.01, 50.0))

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
