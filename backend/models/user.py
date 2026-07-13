from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), default='patient', nullable=False)  # patient, doctor, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Health Profile Fields
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True) # male, female, other
    weight = db.Column(db.Float, nullable=True) # kg
    height = db.Column(db.Float, nullable=True) # cm
    allergies = db.Column(db.Text, nullable=True)
    chronic_conditions = db.Column(db.Text, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'age': self.age,
            'gender': self.gender,
            'weight': self.weight,
            'height': self.height,
            'allergies': self.allergies,
            'chronic_conditions': self.chronic_conditions,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
