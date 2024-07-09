# routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, db, Schedule
from schedule import populate, updateExams

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New user created!'})

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login successful!'})
    return jsonify({'message': 'Invalid username or password'})

@bp.route('user/<int:user_id>/schedule', methods=['POST'])
def init_schedule(user_id):
    user = User.query.get_or_404(user_id)
    if user.schedule:
        return jsonify({'message': 'User schedule already exists'}), 400

    schedule = Schedule(user_id=user_id)
    db.session.add(schedule)
    db.session.commit()
    return jsonify({'message': 'Schedule created'}), 201

@bp.route('user/<int:user_id>/schedule', methods=['GET'])
def get_schedule(user_id):
    user = User.query.get_or_404(user_id)
    if not user.schedule:
        return jsonify({'message': 'User schedule was not found'}), 404
    return jsonify(populate()), 200
