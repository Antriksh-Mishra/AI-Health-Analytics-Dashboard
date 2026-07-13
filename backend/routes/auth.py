from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database.db import db
from models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    role = data.get('role', 'patient').strip().lower()

    if not email or not password or not first_name or not last_name:
        return jsonify({'error': 'Missing required fields'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    if role not in ['patient', 'doctor']:
        role = 'patient'  # Default fallback

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email is already registered'}), 409

    try:
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'user': user.to_dict(),
            'token': access_token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'user': user.to_dict(),
        'token': access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # We import request if it is not imported
    from flask import request
    data = request.get_json() or {}
    
    # Optional field updates
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'age' in data:
        try:
            user.age = int(data['age']) if data['age'] is not None else None
        except ValueError:
            return jsonify({'error': 'Age must be a valid integer'}), 400
    if 'gender' in data:
        user.gender = data['gender']
    if 'weight' in data:
        try:
            user.weight = float(data['weight']) if data['weight'] is not None else None
        except ValueError:
            return jsonify({'error': 'Weight must be a valid float value'}), 400
    if 'height' in data:
        try:
            user.height = float(data['height']) if data['height'] is not None else None
        except ValueError:
            return jsonify({'error': 'Height must be a valid float value'}), 400
    if 'allergies' in data:
        user.allergies = data['allergies']
    if 'chronic_conditions' in data:
        user.chronic_conditions = data['chronic_conditions']
        
    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
