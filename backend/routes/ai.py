from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from database.db import db
from models.report import Report
from services.ai_service import AIService

ai_bp = Blueprint('ai', __name__)
ai_service = AIService()

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat_assistant():
    data = request.get_json() or {}
    message = data.get('message')
    history = data.get('history', [])
    report_id = data.get('report_id')

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    current_user_id = int(get_jwt_identity())
    context = "No specific report linked. Answering general health wellness questions."

    if report_id:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        if report.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized context report'}), 403

        # Formulate context based on report and biometrics
        bio_values = ""
        if report.biometrics:
            b = report.biometrics[0]
            bio_values = (
                f"- Fasting Glucose: {b.blood_sugar} mg/dL\n"
                f"- Hemoglobin: {b.hemoglobin} g/dL\n"
                f"- Total Cholesterol: {b.cholesterol} mg/dL\n"
                f"- Vitamin D: {b.vitamin_d} ng/mL\n"
                f"- Blood Pressure: {b.systolic_bp}/{b.diastolic_bp} mmHg\n"
            )
        
        context = (
            f"Filename: {report.filename}\n"
            f"Upload Date: {report.uploaded_at.isoformat() if report.uploaded_at else ''}\n"
            f"Extracted Biomarkers:\n{bio_values}\n"
            f"OCR Raw Text Snippet:\n{report.raw_text[:2000] if report.raw_text else 'None'}"
        )

    try:
        reply = ai_service.chat_with_assistant(context, history, message)
        return jsonify({'reply': reply}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to generate chat response: {str(e)}'}), 500


@ai_bp.route('/reports/<int:report_id>/insights/re-generate', methods=['POST'])
@jwt_required()
def regenerate_insights(report_id):
    current_user_id = int(get_jwt_identity())
    report = Report.query.get(report_id)
    
    if not report:
        return jsonify({'error': 'Report not found'}), 404
        
    if report.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized report details access'}), 403

    biometrics_dict = {}
    if report.biometrics:
        b = report.biometrics[0]
        biometrics_dict = {
            'blood_sugar': b.blood_sugar,
            'hemoglobin': b.hemoglobin,
            'cholesterol': b.cholesterol,
            'vitamin_d': b.vitamin_d,
            'systolic_bp': b.systolic_bp,
            'diastolic_bp': b.diastolic_bp
        }

    try:
        insights = ai_service.generate_report_insights(report.raw_text, biometrics_dict)
        report.ai_insights = insights
        db.session.commit()
        return jsonify({
            'message': 'AI analysis insights regenerated successfully',
            'report': report.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to regenerate report insights: {str(e)}'}), 500
