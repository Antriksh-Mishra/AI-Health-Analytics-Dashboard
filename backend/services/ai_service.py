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
        
        # Check context indicators
        if "glucose" in msg or "sugar" in msg:
            reply += "Regarding **Fasting Glucose**:\n"
            if "104" in context_string or "elevated" in context_string.lower():
                reply += "* Your fasting glucose is noted as elevated. Normal clinical references are 70-100 mg/dL.\n"
                reply += "* Values between 100-125 mg/dL can suggest prediabetes. Consider decreasing refined sugars and increasing fiber and cardio exercises.\n"
            else:
                reply += "* Normal fasting blood glucose ranges between 70 and 100 mg/dL. Stable values support consistent daily energy levels.\n"
        elif "hemoglobin" in msg or "hb" in msg or "oxygen" in msg:
            reply += "Regarding **Hemoglobin**:\n"
            reply += "* Hemoglobin is the protein in red blood cells that carries oxygen. Normal levels are 12.0-15.5 g/dL for females and 13.5-17.5 g/dL for males.\n"
            reply += "* Low values can indicate iron-deficiency anemia, which can cause fatigue. Focus on iron-rich foods (spinach, lentils, red meat) and Vitamin C to aid absorption.\n"
        elif "cholesterol" in msg or "lipid" in msg:
            reply += "Regarding **Total Cholesterol**:\n"
            reply += "* Healthy cholesterol references are typically under 200 mg/dL. Elevated cholesterol can lead to vascular plaque development.\n"
            reply += "* Try adding dietary soluble fiber (oats, beans) and omega-3 fatty acids (fish, chia seeds) while minimizing saturated fats.\n"
        elif "vitamin d" in msg or "vit d" in msg:
            reply += "Regarding **Vitamin D (25-OH)**:\n"
            reply += "* Healthy levels are defined between 30 and 100 ng/mL. Levels under 30 ng/mL suggest insufficiency, impacting calcium absorption and immune health.\n"
            reply += "* Speak with your doctor about daily Vitamin D3 supplementation and spend 10-15 minutes in morning sunlight.\n"
        elif "pressure" in msg or "bp" in msg:
            reply += "Regarding **Blood Pressure**:\n"
            reply += "* Normal blood pressure is under 120/80 mmHg. Elevated readings suggest your cardiovascular system is working harder.\n"
            reply += "* Focus on low-sodium dietary choices, cardiovascular aerobic exercises, and stress-reduction strategies like meditation.\n"
        else:
            reply += "I can help explain specific parameters in your report. I detected metrics relating to: **Fasting Glucose**, **Hemoglobin**, **Cholesterol**, **Vitamin D**, and **Blood Pressure** in the active context.\n\n"
            reply += "Please ask me about any of these indicators, and I will explain what they represent and outline wellness suggestions!"

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
