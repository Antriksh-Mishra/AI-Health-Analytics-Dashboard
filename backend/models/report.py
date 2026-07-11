from datetime import datetime
from database.db import db

class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    ocr_status = db.Column(db.String(20), default='pending', nullable=False)  # pending, processing, completed, failed
    raw_text = db.Column(db.Text, nullable=True)
    ai_insights = db.Column(db.Text, nullable=True)  # JSON-string cache of Gemini synthesis
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    # Relationships
    biometrics = db.relationship('BiometricData', backref='report', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        import json
        parsed_insights = None
        if self.ai_insights:
            try:
                parsed_insights = json.loads(self.ai_insights)
            except Exception:
                parsed_insights = self.ai_insights

        return {
            'id': self.id,
            'filename': self.filename,
            'file_path': self.file_path,
            'ocr_status': self.ocr_status,
            'raw_text': self.raw_text,
            'ai_insights': parsed_insights,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'user_id': self.user_id,
            'biometrics': [b.to_dict() for b in self.biometrics]
        }
