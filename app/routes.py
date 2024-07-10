from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Task, Performance
from datetime import datetime, timedelta
from app.schedule import populate, generate_study_plan
from app.db import db
import random

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password,
        study_hours_per_day=data['study_hours_per_day'],
        preferred_study_time=data['preferred_study_time']
    )
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
# On login redirect to schedule and populate it
@bp.route('/add_assessment', methods=['POST'])
def add_assessment():
    data = request.get_json()
    user_id = data['user_id']
    new_task = Task(
        user_id=user_id,
        name=data['name'],
        task_type=data['task_type'],
        priority=data['priority'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        start_time=datetime.strptime(data['start_time'], '%H:%M:%S').time() if data.get('start_time') else None,
        end_time=datetime.strptime(data['end_time'], '%H:%M:%S').time() if data.get('end_time') else None
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'message': 'New assessment added!'})

@bp.route('/schedule/<int:user_id>/classes', methods=['POST'])
def add_classes(user_id):
    data = request.get_json()
    classes = data # would be all of the inputed classes
    classTasks = []
    for cl in classes:
        clas = Task(
            user_id=user_id,
            name=cl['className'],
            task_type="Class",
            start_time=datetime.strptime(cl['startTimeHour']+":"+cl['startTimeMinute'])
        )
    db.session.add_all(classTasks)
    db.session.commit()
@bp.route('/schedule/<int:user_id>/task/<int:task_id>/remove', methods=['post'])
def remove_task(user_id, task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    if task.children:
        child_task = task.children
        for child in child_task:
            db.session.remove(child)
    db.session.remove(task)
    db.session.commit()
    return jsonify({'message': 'Task and all related child tasks removed'})

@bp.route('/schedule/<int:user_id>', methods=['GET'])
def get_schedule(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # tasks = Task.query.filter_by(user_id=user_id).all()
    # study_plan = generate_study_plan(user, tasks)
    schedule = populate(user.id)
    return jsonify(schedule)

# when creating the plan for tasks, should the user then input the amount of hours it would take?
@bp.route('/schedule/<int:user_id>/task/<int:task_id>/new_study_plan', methods=['POST'])
def create_study_plan(user_id, task_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    allStudySessions = generate_study_plan(user, task)
    db.session.add_all(allStudySessions)
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