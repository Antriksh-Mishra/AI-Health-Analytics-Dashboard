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
            tsh=parsed.get('tsh'),
            systolic_bp=parsed.get('systolic_bp'),
            diastolic_bp=parsed.get('diastolic_bp')
        )
        biometric.set_json_data(parsed.get('extra_metrics', {}))
        
        db.session.add(biometric)
        db.session.commit()
        
        # Pre-cache Gemini AI clinical insights
        from services.ai_service import AIService
        ai_service = AIService()
        biometrics_dict = {
            'blood_sugar': biometric.blood_sugar,
            'hemoglobin': biometric.hemoglobin,
            'cholesterol': biometric.cholesterol,
            'vitamin_d': biometric.vitamin_d,
            'tsh': biometric.tsh,
            'systolic_bp': biometric.systolic_bp,
            'diastolic_bp': biometric.diastolic_bp
        }
        try:
            insights = ai_service.generate_report_insights(raw_text, biometrics_dict)
            report.ai_insights = insights
            db.session.commit()
        except Exception as ai_err:
            print(f"Failed to generate AI insights during upload: {str(ai_err)}")

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


@reports_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    current_user_id = int(get_jwt_identity())
    
    # Query all biometric data records for this user
    biometrics = BiometricData.query.filter_by(user_id=current_user_id).all()
    
    # Sort chronologically by test_date if present, falling back to created_at
    def get_sort_key(bio):
        return bio.test_date if bio.test_date else bio.created_at
        
    biometrics_sorted = sorted(biometrics, key=get_sort_key)
    
    # Format and serialize chronological data points
    data_points = []
    for bio in biometrics_sorted:
        report = Report.query.get(bio.report_id)
        filename = report.filename if report else "Unknown Report"
        
        record_date = bio.test_date if bio.test_date else bio.created_at
        date_str = record_date.strftime("%Y-%m-%d")
        
        bp_str = f"{bio.systolic_bp}/{bio.diastolic_bp}" if bio.systolic_bp and bio.diastolic_bp else None
        
        data_points.append({
            'id': bio.id,
            'report_id': bio.report_id,
            'filename': filename,
            'date': date_str,
            'hemoglobin': bio.hemoglobin,
            'blood_sugar': bio.blood_sugar,
            'cholesterol': bio.cholesterol,
            'vitamin_d': bio.vitamin_d,
            'systolic_bp': bio.systolic_bp,
            'diastolic_bp': bio.diastolic_bp,
            'bp_display': bp_str,
            'extra_metrics': bio.get_json_data()
        })
        
    return jsonify(data_points), 200
