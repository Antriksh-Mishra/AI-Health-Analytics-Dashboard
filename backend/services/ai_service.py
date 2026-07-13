import os
import json
import google.generativeai as genai

class AIService:
    def __init__(self):
        self.api_key_configured = False
        self._configure_api()

    def _configure_api(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.api_key_configured = True
        else:
            print("WARNING: GEMINI_API_KEY environment variable is not configured. AI functions will run in simulated mode.")

    def generate_report_insights(self, raw_text, biometrics_dict):
        """Generates structured report summary, alert flags, and wellness recommendations using Gemini."""
        if not self.api_key_configured:
            # Re-configure in case key was added during runtime
            self._configure_api()

        if not self.api_key_configured:
            return self._generate_simulated_insights(biometrics_dict)

        prompt = f"""
You are MedIntel AI, a clinical medical intelligence analytics engine. Analyze the following laboratory test data and raw text.
Return a single, raw, minified JSON object matching the exact keys below. DO NOT output any markdown backticks, explanations, or text surrounding the JSON.

Expected JSON Structure:
{{
  "summary": "2-3 sentence executive clinical summary of the patient's general health based on the findings.",
  "flagged_items": [
    {{
      "metric": "Name of the indicator (e.g., Fasting Glucose)",
      "value": "104 mg/dL",
      "range": "Normal range description (e.g., 70-100 mg/dL)",
      "reason": "Clear explanation of why it is flagged, potential impact, and normal references."
    }}
  ],
  "wellness_recommendations": [
    "Specific nutrition, hydration, exercise, or supplement advice related to the results.",
    "Physician follow-up suggestion if major indicators are out of spec."
  ]
}}

Active Biometric Metrics Isolated:
- Fasting Glucose/Sugar: {biometrics_dict.get('blood_sugar')} mg/dL (Normal: 70-100)
- Hemoglobin: {biometrics_dict.get('hemoglobin')} g/dL (Normal: 13.5-17.5 for males, 12.0-15.5 for females)
- Total Cholesterol: {biometrics_dict.get('cholesterol')} mg/dL (Normal: <200)
- Vitamin D (25-OH): {biometrics_dict.get('vitamin_d')} ng/mL (Normal: 30-100)
- Blood Pressure: {biometrics_dict.get('systolic_bp')}/{biometrics_dict.get('diastolic_bp')} mmHg (Normal: 120/80)

Raw Extract Text Content:
{raw_text}
"""
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt, request_options={"timeout": 10.0})
            text_response = response.text.strip()
            
            # Sanitize markdown code blocks if the model wrapped the JSON
            if text_response.startswith("```"):
                text_response = text_response.split("```")[1]
                if text_response.startswith("json"):
                    text_response = text_response[4:]
            
            text_response = text_response.strip()
            
            # Verify valid JSON
            json.loads(text_response)
            return text_response
        except Exception as e:
            print(f"Gemini API Error: {str(e)}. Falling back to simulated insights.")
            return self._generate_simulated_insights(biometrics_dict)

    def chat_with_assistant(self, context_string, chat_history, user_message):
        """Processes conversational chatbot requests, outputting patient-friendly summaries."""
        if not self.api_key_configured:
            self._configure_api()

        if not self.api_key_configured:
            return "Hello! I am running in local offline demo mode because no `GEMINI_API_KEY` was found in the environment. Please add it to your `.env` file to enable conversational AI insights."

        history_prompt = ""
        for msg in chat_history:
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_prompt += f"{role}: {msg.get('content')}\n"

        prompt = f"""
You are MedIntel AI, a professional, empathetic clinical assistant helping the patient understand their lab test metrics.
Explain medical terms in simple, plain, easy-to-understand language. 
ALWAYS end by warning the user that this analysis is informational and not a substitute for formal clinical visits, and that they must consult their primary physician.

Report Patient Context Values:
{context_string}

Conversation History:
{history_prompt}
User: {user_message}
Assistant:"""
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt, request_options={"timeout": 10.0})
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API Quota Error: {str(e)}. Running in offline simulated chat mode.")
            return self._generate_simulated_chat_reply(context_string, user_message)

    def _generate_simulated_chat_reply(self, context_string, user_message):
        """Generates smart local responses on Gemini quota limits or errors."""
        msg = user_message.lower()
        reply = (
            "⚠️ **MedIntel Offline Wellness Mode** (Your Gemini API key has exceeded its Free Tier quota limit or requires billing activation in Google AI Studio).\n\n"
        )
        
        # 1. Overall Reports Check
        if "overall reports" in msg or "explain reports" in msg or "explain my report" in msg or "summary" in msg:
            reply += "### 📋 MedIntel Local Report Analysis Summary:\n"
            reply += "Here is a general clinical explanation of the indicators present in your active health reports:\n\n"
            
            reply += "1. **Fasting Glucose**: Reflects your blood sugar regulation after an overnight fast. Normal values are 70–100 mg/dL. Elevated glucose can indicate prediabetes or insulin resistance, which shifts energy levels and increases cardiovascular workloads.\n"
            reply += "2. **Hemoglobin**: The vital oxygen-carrying protein in red blood cells. Normal range is 12.0–15.5 g/dL (females) and 13.5–17.5 g/dL (males). Lower values indicate iron deficiencies or fatigue risks.\n"
            reply += "3. **Vitamin D (25-OH)**: Controls bone density, calcium absorption, and immune response. Target levels are 30–100 ng/mL. Deficiencies are highly common and can impact overall mood and muscle recovery.\n"
            reply += "4. **Blood Pressure**: Measures the force of blood flow on arterial walls. Normal values are under 120/80 mmHg. Managing this reduces long-term cardiac strain.\n\n"
            reply += "**Next Steps**: Consult the interactive **Analytics** page to track how these values are trending over time, and download the formatted PDF to share with your primary care provider."

        # 2. Blood Pressure Check
        elif "blood pressure" in msg or "bp" in msg or "pressure" in msg:
            reply += "### 🩸 Blood Pressure Clinical Reference Guide:\n"
            reply += "Blood pressure measures the systolic pressure (arterial force when the heart beats) over diastolic pressure (force when the heart rests):\n\n"
            reply += "* **Normal**: Less than 120/80 mmHg\n"
            reply += "* **Elevated**: 120-129 / <80 mmHg\n"
            reply += "* **Hypertension (Stage 1)**: 130-139 / 80-89 mmHg\n"
            reply += "* **Hypertension (Stage 2)**: 140/90 mmHg or higher\n\n"
            reply += "**Actionable Wellness Suggestions to Improve Blood Pressure:**\n"
            reply += "* **Manage Dietary Sodium**: Aim to consume less than 2,300 mg of sodium daily, focusing on fresh vegetables and home-cooked meals.\n"
            reply += "* **Incorporate Aerobic Exercise**: Engage in 30 minutes of moderate cardiovascular activities (like brisk walking or swimming) 5 times a week.\n"
            reply += "* **Stress Reduction**: Implement daily deep breathing exercises, mindfulness meditation, or yoga to lower arterial stress hormones.\n"
            reply += "* **Limit Stimulants**: Moderate caffeine and alcohol consumption to avoid transient arterial spikes."

        # 3. Vitamin D Improvement
        elif "vitamin d" in msg or "vit d" in msg or "improve vitamin" in msg:
            reply += "### ☀️ Vitamin D Improvement & Action Plan:\n"
            reply += "Vitamin D is synthesized by your skin when exposed to UV light, or absorbed through dietary sources. Standard healthy levels range between 30 and 100 ng/mL:\n\n"
            reply += "**Actionable Wellness Suggestions to Improve Vitamin D:**\n"
            reply += "* **Safe Sun Exposure**: Spend 10 to 15 minutes in direct morning sunlight (arms and face exposed) without sunscreen daily.\n"
            reply += "* **D3 Supplementation**: Discuss starting a Vitamin D3 supplement (e.g. 1,000 to 2,000 IU daily) with your physician, particularly during winter months.\n"
            reply += "* **Dietary Intake**: Focus on foods rich in Vitamin D, including fatty fish (salmon, mackerel, sardines), beef liver, egg yolks, and fortified cereals or milk.\n"
            reply += "* **Co-Factor Support**: Ensure adequate magnesium and Vitamin K2 intake, as they assist in activating and directing calcium into the bones."

        # 4. Fasting Glucose / Blood Sugar Check
        elif "glucose" in msg or "sugar" in msg or "fasting" in msg:
            reply += "### 🍬 Fasting Glucose General Effects & Reference Guide:\n"
            reply += "Fasting glucose measures the concentration of sugar in your bloodstream after an 8-12 hour fast. Reference levels:\n\n"
            reply += "* **Normal**: 70 to 100 mg/dL\n"
            reply += "* **Prediabetes**: 101 to 125 mg/dL (indicates insulin resistance)\n"
            reply += "* **Diabetes range**: 126 mg/dL or higher\n\n"
            reply += "**General Physiological Effects of Elevated Fasting Sugar:**\n"
            reply += "* **Fatigue**: Fluctuating glucose causes energy highs followed by sudden crashes.\n"
            reply += "* **Vascular Strain**: Excess bloodstream glucose can place stress on vascular linings.\n\n"
            reply += "**Actionable Wellness Suggestions to Stabilize Glucose:**\n"
            reply += "* **Rebalance Carbohydrates**: Minimize simple sugars, refined flours, and sweet sodas. Swap them for complex, fiber-rich options like legumes, oats, and whole grains.\n"
            reply += "* **Post-Meal Walks**: Try taking a brisk 10 to 15-minute walk immediately after your largest meals to assist muscles in directly absorbing glucose from the bloodstream.\n"
            reply += "* **Hydrate with Water**: Proper hydration assists your kidneys in flushing excess sugar through urination.\n"
            reply += "* **Support Sleep Quality**: Chronic sleep deprivation raises cortisol levels, which raises blood sugar."

        # Default fallback
        else:
            reply += "I can help explain specific parameters in your report. I detected metrics relating to: **Fasting Glucose**, **Hemoglobin**, **Cholesterol**, **Vitamin D**, and **Blood Pressure** in the active context.\n\n"
            reply += "Please ask me about any of these indicators (e.g. *'Explain my overall reports'*, *'Check my Blood Pressure'*, *'How to improve Vitamin D'*, or *'Fasting Glucose query'*), and I will explain what they represent and outline wellness suggestions!"

        reply += "\n\n***\n*Disclaimer: MedIntel AI insights are for informational support only and do not replace professional medical advice. Always consult your primary care doctor for diagnostics and treatment plans.*"
        return reply

    def _generate_simulated_insights(self, biometrics_dict):
        """Simulates structured analysis in case no API key exists or call fails."""
        flagged = []
        recommendations = []
        
        sugar = biometrics_dict.get('blood_sugar')
        if sugar:
            if sugar > 100:
                flagged.append({
                    "metric": "Fasting Glucose",
                    "value": f"{sugar} mg/dL",
                    "range": "70-100 mg/dL",
                    "reason": "Slightly elevated fasting sugar indicates prediabetes. Limit refined carbohydrates."
                })
                recommendations.append("Reduce sugar intake and implement a walking routine after meals.")
            elif sugar < 70:
                flagged.append({
                    "metric": "Fasting Glucose",
                    "value": f"{sugar} mg/dL",
                    "range": "70-100 mg/dL",
                    "reason": "Hypoglycemia detected. Monitor for symptoms like shakiness or dizziness."
                })
        
        hb = biometrics_dict.get('hemoglobin')
        if hb and (hb < 12.0 or hb > 17.5):
            flagged.append({
                "metric": "Hemoglobin",
                "value": f"{hb} g/dL",
                "range": "12.0-17.5 g/dL",
                "reason": f"Out of specification. Low values may suggest mild anemia."
            })
            recommendations.append("Consider iron-rich foods like leafy greens, red meat, or lentils.")
            
        chol = biometrics_dict.get('cholesterol')
        if chol and chol > 200:
            flagged.append({
                "metric": "Total Cholesterol",
                "value": f"{chol} mg/dL",
                "range": "< 200 mg/dL",
                "reason": "High cholesterol levels can increase lipid plaque risks. Limit saturated fats."
            })
            recommendations.append("Incorporate healthy omega-3 fats (salmon, walnuts, chia seeds) into your meals.")
            
        vit_d = biometrics_dict.get('vitamin_d')
        if vit_d and vit_d < 30:
            flagged.append({
                "metric": "Vitamin D",
                "value": f"{vit_d} ng/mL",
                "range": "30-100 ng/mL",
                "reason": "Vitamin D deficiency. Common in indoor settings. Can impact bone density and immune health."
            })
            recommendations.append("Spend 15 minutes in sunlight daily or discuss Vitamin D3 supplementation with your doctor.")

        sys = biometrics_dict.get('systolic_bp')
        dia = biometrics_dict.get('diastolic_bp')
        if sys and dia:
            if sys > 130 or dia > 85:
                flagged.append({
                    "metric": "Blood Pressure",
                    "value": f"{sys}/{dia} mmHg",
                    "range": "< 120/80 mmHg",
                    "reason": "Hypertension levels detected. Monitor sodium intake and cardiovascular stress levels."
                })
                recommendations.append("Reduce sodium (salt) intake and manage chronic stressors.")

        if not recommendations:
            recommendations.append("Maintain your balanced hydration and regular clinical checkups.")
        recommendations.append("Schedule a follow-up consultation with your primary physician to discuss these results.")

        summary = "Based on the isolated biometric metrics, your parameters are generally stable, though some items require attention. "
        if flagged:
            summary += f"We noted {len(flagged)} indicator(s) outside optimal clinical reference limits: {', '.join([f['metric'] for f in flagged])}."
        else:
            summary += "All tested lab values are within standard healthy ranges."

        return json.dumps({
            "summary": summary,
            "flagged_items": flagged,
            "wellness_recommendations": recommendations
        })

    def generate_comparison_insights(self, report1, report2):
        """Generates patient-friendly comparison summary between report1 (older) and report2 (newer)."""
        if not self.api_key_configured:
            self._configure_api()
            
        if not self.api_key_configured:
            return self._generate_simulated_comparison(report1, report2)
            
        prompt = f"""
You are MedIntel AI, a clinical medical intelligence analytics engine. Generate a comparative progress overview comparing two patient report measurements.

Report 1 (Older, Date: {report1.get('date')}):
- Glucose: {report1.get('blood_sugar')} mg/dL
- Hemoglobin: {report1.get('hemoglobin')} g/dL
- Vitamin D: {report1.get('vitamin_d')} ng/mL
- Blood Pressure: {report1.get('bp_display')} mmHg

Report 2 (Newer, Date: {report2.get('date')}):
- Glucose: {report2.get('blood_sugar')} mg/dL
- Hemoglobin: {report2.get('hemoglobin')} g/dL
- Vitamin D: {report2.get('vitamin_d')} ng/mL
- Blood Pressure: {report2.get('bp_display')} mmHg

Write a patient-friendly comparative progress summary (2-3 paragraphs max). Detail:
1. What values improved (moving closer to normal references), what stayed the same, and what requires attention.
2. Direct action advice (dietary, lifestyle, sunlight, hydration) based on the deltas.
3. Keep the tone clinical, supportive, and non-diagnostic. Emphasize doctor consult for treatment changes.
"""
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt, request_options={"timeout": 10.0})
            return response.text.strip()
        except Exception as e:
            print(f"Gemini Comparison API Error: {str(e)}. Running in simulated offline comparison mode.")
            return self._generate_simulated_comparison(report1, report2)

    def _generate_simulated_comparison(self, report1, report2):
        # Simulated comparative insights when Gemini key is rate-limited or missing
        changes = []
        
        # Sugar check
        s1 = report1.get('blood_sugar')
        s2 = report2.get('blood_sugar')
        if s1 is not None and s2 is not None:
            if s2 < s1:
                changes.append(f"Fasting sugar levels improved from {s1} to {s2} mg/dL, showing beneficial glycemic progress.")
            elif s2 > s1:
                changes.append(f"Fasting sugar level shifted higher from {s1} to {s2} mg/dL, which warrants dietary focus.")
                
        # Vit D check
        d1 = report1.get('vitamin_d')
        d2 = report2.get('vitamin_d')
        if d1 is not None and d2 is not None:
            if d2 > d1:
                changes.append(f"Vitamin D increased from {d1} to {d2} ng/mL, indicating improved absorption or supplementation compliance.")
            elif d2 < d1:
                changes.append(f"Vitamin D decreased from {d1} to {d2} ng/mL, suggesting a need for more morning sunlight exposure or supplement reviews.")
                
        # Hb check
        h1 = report1.get('hemoglobin')
        h2 = report2.get('hemoglobin')
        if h1 is not None and h2 is not None:
            if h2 >= 12.0 and h1 < 12.0:
                changes.append(f"Hemoglobin recovered from {h1} to {h2} g/dL, indicating stable red blood cell counts.")
            elif h2 < h1:
                changes.append(f"Hemoglobin shifted from {h1} to {h2} g/dL.")
                
        # BP check
        sys1 = report1.get('systolic_bp')
        sys2 = report2.get('systolic_bp')
        if sys1 is not None and sys2 is not None:
            if sys2 < sys1:
                changes.append(f"Blood pressure stabilized from {sys1} mmHg systolic down to {sys2} mmHg systolic.")
            elif sys2 > sys1:
                changes.append(f"Blood pressure increased to {sys2} mmHg systolic compared to {sys1} mmHg previously.")
                
        summary_intro = f"Comparative progress analysis between {report1.get('date')} and {report2.get('date')}:\n\n"
        if not changes:
            summary_intro += "No significant changes were isolated between the two selected test date parameters. Values remain stable."
        else:
            summary_intro += " ".join(changes)
            
        summary_intro += "\n\nDisclaimer: MedIntel AI insights are for supportive health analysis only. Speak with your primary care doctor regarding specific diagnostic indicators or supplement dosage plans."
        return summary_intro
