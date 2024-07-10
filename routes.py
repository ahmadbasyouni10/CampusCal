# routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, db, Schedule, Task
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

# add security for only allowing the user to look at their schedule
@bp.route('/user/<int:user_id>/schedule', methods=['GET'])
def get_schedule(user_id):
    user = User.query.get_or_404(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(populate()), 200

@bp.route('/user/<int:user_id>/task', methods=['POST'])
def create_Task(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    task = Task(user_id=user_id, name=data['name'], task_type=data['type'],
                priority=data['priority'], date=data['date'], start_time=data['start_time'],
                end_time=data['end_time'])
    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Task created!'})

@bp.route('/user/<int:user_id>/task/<int:task_id>', methods=['GET'])
def delete_Task(user_id, task_id):
    task = Task.query.get_or_404(task_id)