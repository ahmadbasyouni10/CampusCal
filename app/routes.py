from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Task, Performance
from datetime import datetime, timedelta, time
from app.schedule import populate, generate_study_plan
import random
from app import db

bp = Blueprint('routes', __name__)

@bp.errorhandler(Exception)
def handle_exception(e):
    return jsonify({'error': 'A server error occurred', 'details': str(e)}), 500

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['username', 'password']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    new_user = User(
        username=data['username'],
        password=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        sleep_hours=data.get('sleep_hours', 8),
        other_commitments=data.get('other_commitments', ''),
        study_hours_per_day=data.get('study_hours_per_day', 2),
        preferred_study_time=data.get('preferred_study_time', 'morning')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New user created!'}), 201

@bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400

    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username or password missing'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    return jsonify({'message': 'Login successful!', 'user_id': user.id, 'username': user.username}), 200

@bp.route('/user/<int:user_id>/add_assessment', methods=['POST'])
def add_assessment(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    required_fields = ['name', 'priority', 'date']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required field(s): {", ".join(missing_fields)}'}), 400

    try:
        new_task = Task(
            user_id=user_id,
            name=data['name'],
            priority=data['priority'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data.get('start_time', '00:00:00'), '%H:%M:%S').time(),
            end_time=datetime.strptime(data.get('end_time', '23:59:59'), '%H:%M:%S').time(),
            performance=data.get('performance')
        )
        db.session.add(new_task)
        db.session.commit()

        # Fetch all assessments for the user
        assessments = Task.query.filter_by(user_id=user_id).all()
        assessments_data = [{
            'name': assessment.name,
            'priority': assessment.priority,
            'date': assessment.date.strftime('%Y-%m-%d'),
            'start_time': assessment.start_time.strftime('%H:%M:%S'),
            'end_time': assessment.end_time.strftime('%H:%M:%S'),
            'performance': assessment.performance
        } for assessment in assessments]

        return jsonify({'message': 'Assessment added!', 'assessments': assessments_data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add assessment: {str(e)}'}), 500

@bp.route('/schedule/<int:user_id>/events', methods=['GET', 'POST'])
def get_events(user_id):
    if request.method == 'GET':
        events = Task.query.filter_by(user_id=user_id).all()
        formatted_events = [{
            'id': event.id,
            'name': event.name,
            'date': event.date.strftime('%Y-%m-%d'),
            'start_time': event.start_time.strftime('%H:%M:%S') if event.start_time else None,
            'end_time': event.end_time.strftime('%H:%M:%S') if event.end_time else None,
            'priority': event.priority
        } for event in events]
        return jsonify(formatted_events)
    elif request.method == 'POST':
        data = request.get_json()
        new_event = Task(
            user_id=user_id,
            name=data['name'],
            priority=data['priority'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start_time'], '%H:%M:%S').time() if data.get('start_time') else None,
            end_time=datetime.strptime(data['end_time'], '%H:%M:%S').time() if data.get('end_time') else None,
        )
        db.session.add(new_event)
        db.session.commit()
        return jsonify({'message': 'Event added successfully'}), 201

@bp.route('/schedule/<int:user_id>/task/<int:task_id>/remove', methods=['POST'])
def remove_task(user_id, task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    if task.children:
        for child in task.children:
            db.session.delete(child)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task and all related child tasks removed'})

@bp.route('/schedule/<int:user_id>', methods=['GET'])
def get_schedule(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    schedule = populate(user.id)
    return jsonify(schedule)

@bp.route('/schedule/<int:user_id>/task/<int:task_id>/new_study_plan', methods=['POST'])
def create_study_plan(user_id, task_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    all_study_sessions = generate_study_plan(user, task)
    db.session.add_all(all_study_sessions)
    db.session.commit()

    return jsonify(populate(user.id))

@bp.route('/update_performance', methods=['POST'])
def update_performance():
    data = request.get_json()
    user_id = data['user_id']
    task_id = data['task_id']
    score = data['score']
    
    performance = Performance.query.filter_by(user_id=user_id, task_id=task_id).first()
    if performance:
        performance.score = score
    else:
        new_performance = Performance(user_id=user_id, task_id=task_id, score=score)
        db.session.add(new_performance)
    
    db.session.commit()
    
    user = User.query.get(user_id)
    performances = Performance.query.filter_by(user_id=user_id).all()
    adjusted_study_plan = adjust_study_plan_based_on_performance(user, performances)
    
    return jsonify({'message': 'Performance updated!', 'adjusted_study_plan': adjusted_study_plan})

def adjust_study_plan_based_on_performance(user, performances):
    adjusted_plan = []
    
    for performance in performances:
        task = Task.query.get(performance.task_id)
        days_until_due = (task.date - datetime.now().date()).days
        
        if performance.score < 6:
            days_to_study = days_until_due
            study_hours_per_day = user.study_hours_per_day + 1
        elif performance.score >= 8:
            days_to_study = days_until_due // 2
            study_hours_per_day = user.study_hours_per_day - 1
        else:
            days_to_study = days_until_due // 3
            study_hours_per_day = user.study_hours_per_day

        for day in range(days_to_study):
            study_date = (datetime.now() + timedelta(days=random.randint(0, days_until_due))).date().isoformat()
            adjusted_plan.append({
                'task': task.name,
                'study_hours': study_hours_per_day,
                'date': study_date
            })
    
    return adjusted_plan