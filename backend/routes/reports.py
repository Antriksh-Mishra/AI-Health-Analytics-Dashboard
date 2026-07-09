import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from database.db import db
from models.report import Report
from models.biometric import BiometricData
from services.ocr_service import OCRService

reports_bp = Blueprint('reports', __name__)
ocr_service = OCRService()

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@reports_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_report():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'File type not supported. Use PDF, PNG, JPG, JPEG, or TIFF'}), 400

    current_user_id = int(get_jwt_identity())
    
    # Secure filename and directory setup
    filename = secure_filename(file.filename)
    # Prefix filename with user ID and timestamp to guarantee uniqueness
    from time import time
    unique_filename = f"{current_user_id}_{int(time())}_{filename}"
    
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, unique_filename)
    
    # Save file
    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

    # Create Report record
    report = Report(
        filename=filename,
        file_path=file_path,
        ocr_status='processing',
        user_id=current_user_id
    )
    db.session.add(report)
    db.session.commit()

    # Process OCR
    try:
        raw_text = ocr_service.extract_text(file_path)
        report.raw_text = raw_text
        report.ocr_status = 'completed'
        
        # Parse health metrics
        parsed = ocr_service.parse_metrics(raw_text)
        
        biometric = BiometricData(
            report_id=report.id,
            user_id=current_user_id,
            test_date=parsed.get('test_date'),
            hemoglobin=parsed.get('hemoglobin'),
            blood_sugar=parsed.get('blood_sugar'),
            cholesterol=parsed.get('cholesterol'),
            vitamin_d=parsed.get('vitamin_d'),
            systolic_bp=parsed.get('systolic_bp'),
            diastolic_bp=parsed.get('diastolic_bp')
        )
        biometric.set_json_data(parsed.get('extra_metrics', {}))
        
        db.session.add(biometric)
        db.session.commit()
        
        return jsonify({
            'message': 'Report uploaded and analyzed successfully',
            'report': report.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        report.ocr_status = 'failed'
        db.session.commit()
        # Log the error trace
        print(f"OCR Error processing report {report.id}: {str(e)}")
        return jsonify({
            'error': f'OCR analysis failed: {str(e)}',
            'report': report.to_dict()
        }), 500


@reports_bp.route('', methods=['GET'])
@jwt_required()
def get_reports():
    current_user_id = int(get_jwt_identity())
    reports = Report.query.filter_by(user_id=current_user_id).order_by(Report.uploaded_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200


@reports_bp.route('/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_report(report_id):
    current_user_id = int(get_jwt_identity())
    report = Report.query.get(report_id)
    
    if not report:
        return jsonify({'error': 'Report not found'}), 404
        
    if report.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized access to report'}), 403

    try:
        # Delete file from disk
        if os.path.exists(report.file_path):
            os.remove(report.file_path)
            
        db.session.delete(report)
        db.session.commit()
        return jsonify({'message': 'Report deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete report: {str(e)}'}), 500
