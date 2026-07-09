from datetime import datetime
from database.db import db
import json

class BiometricData(db.Model):
    __tablename__ = 'biometric_data'

    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    test_date = db.Column(db.DateTime, nullable=True)
    
    # Core tracked lab metrics
    hemoglobin = db.Column(db.Float, nullable=True)  # g/dL
    blood_sugar = db.Column(db.Float, nullable=True)  # mg/dL
    cholesterol = db.Column(db.Float, nullable=True)  # mg/dL
    vitamin_d = db.Column(db.Float, nullable=True)  # ng/mL
    systolic_bp = db.Column(db.Integer, nullable=True)  # mmHg
    diastolic_bp = db.Column(db.Integer, nullable=True)  # mmHg
    
    # Store any other values in flexible JSON
    raw_extracted_json = db.Column(db.Text, default='{}', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_json_data(self, data):
        self.raw_extracted_json = json.dumps(data)

    def get_json_data(self):
        try:
            return json.loads(self.raw_extracted_json)
        except Exception:
            return {}

    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'user_id': self.user_id,
            'test_date': self.test_date.isoformat() if self.test_date else None,
            'hemoglobin': self.hemoglobin,
            'blood_sugar': self.blood_sugar,
            'cholesterol': self.cholesterol,
            'vitamin_d': self.vitamin_d,
            'systolic_bp': self.systolic_bp,
            'diastolic_bp': self.diastolic_bp,
            'extra_metrics': self.get_json_data(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
