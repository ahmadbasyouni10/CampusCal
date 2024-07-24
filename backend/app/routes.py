from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Task, Performance
from datetime import datetime, timedelta
from app.schedule import populate, generate_study_plan, setSleep
import random, requests, json
from app import db
from requests.exceptions import JSONDecodeError
from sqlalchemy.exc import SQLAlchemyError
from backend.ml_model import optimize_study_plan

bp = Blueprint('routes', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    new_user = User(
        username=data['username'],
        password=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        sleep_hours=data.get('sleepHours', 8),
        other_commitments=data.get('otherCommitments', ''),
        study_hours_per_day=data.get('studyHoursPerDay', 2),
        preferred_study_time=data.get('preferredStudyTime', 'morning')
    )
    db.session.add(new_user)
    db.session.commit()
    sleeps = setSleep(new_user.id, new_user.sleep_hours)
    db.session.add_all(sleeps)
    db.session.commit()
    return jsonify({'message': 'New user created!'})


@bp.route('/login', methods=['POST', 'OPTIONS'])  # Allow OPTIONS method for CORS preflight
def login():
    if request.method == 'OPTIONS':  # Handle preflight request for CORS
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
        return jsonify({'message': 'Invalid username or password'}), 401

    # Assuming you want to return some data upon successful login
    return jsonify({'message': 'Login successful!', 'username': user.username, 'user_id': user.id})


@bp.route('/add_assessment', methods=['POST', 'PUT'])
def add_assessment():
    data = request.get_json()
    if request.method == 'POST':
        user_id = data['user_id']
        new_task = Task(
            user_id=user_id,
            name=data['name'],
            priority=data['priority'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['start'], '%Y-%m-%dT%H:%M:%S').time() if data.get('start') else None,
            end_time=datetime.strptime(data['end'], '%Y-%m-%dT%H:%M:%S').time() if data.get('end') else None
        )
        db.session.add(new_task)
    else:
        task_id = data.get("id")
        if task_id is None:
            return jsonify({'message': 'Task ID is required for updates.'}), 400
        task = Task.query.get(task_id)
        if task is None:
            return jsonify({'message': 'Task not found.'}), 404
        if 'name' in data:
            task.name = data['name']
        if 'priority' in data:
            task.priority = data['priority']
        # Consider adding updates for date, start_time, and end_time as well

    db.session.commit()
    return jsonify({'message': 'New assessment updated or added!', "task_id": new_task.id if request.method == 'POST' else task_id})

@bp.route('/schedule/<int:user_id>/classes', methods=['POST'])
def add_classes(user_id):
    data = request.get_json()
    # would be all of the inputed classes
    classTasks = []
    # gets the first class
    initialClass = Task(
        user_id=user_id,
        name=data['name'],
        task_type='class',
        date=datetime.strptime(data['startDate'], '%Y-%m-%d').date(),
        start_time=datetime.strptime(data['start'], '%Y-%m-%dT%H:%M:%S').time() if data.get('start') else None,
        end_time=datetime.strptime(data['end'], '%Y-%m-%dT%H:%M:%S').time() if data.get('end') else None,
        priority=data['color']
        )
    classTasks.append(initialClass)
    print("In add_classes")
    # This gets all of the days that the class is on
    daysToDatetime = {
        'monday': 0,
        'tuesday': 1,
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
        'sunday': 6
    } # This is to convert the days to datetime integers
    
    # This gets all of the days that the class is on
    daysOfTheWeek = [daysToDatetime[day] for day, isSelected in data['days'].items() if isSelected]
    daysOfTheWeek.sort() # gets it in order monday to sunday
    n = len(daysOfTheWeek)
    if initialClass.date.weekday() in daysOfTheWeek:
        n-= 1
        daysOfTheWeek.remove(initialClass.date.weekday())
    else:
        initialClass.date = initialClass.date + timedelta(days=(daysOfTheWeek[0] - initialClass.date.weekday()))
        n-= 1
        daysOfTheWeek.pop(0)
    classTasks.append(initialClass)
    initalClasses = [initialClass]
    # this gets all of the inital classes for the first week of classes
    for i in range(n):
        newClass = Task(
            user_id=user_id,
            name=data['name'],
            task_type='class',
            date=initialClass.date + timedelta(days=(daysOfTheWeek[i]-initialClass.date.weekday())),
            start_time=initialClass.start_time,
            end_time=initialClass.end_time,
            parent_id=initialClass.id,
            priority=initialClass.priority
        )
        classTasks.append(newClass)
        initalClasses.append(newClass)
    daysOfTheWeek.append(initialClass.date.weekday())

    dates = [c.date +timedelta(days=7) for c in initalClasses]

    currentDate = dates[0]
    i = 0
    # Classes on Monday, Wednesday, Friday
    # Start on Monday, then move currentDate to Wednesday, then to Friday, then to Monday
    # repeatily adds classes until the end date, making sure to only add on days that the user has classes
    while currentDate <= datetime.strptime(data['endDate'], '%Y-%m-%d').date():
        # print("In while loop in add_classes currendate: "+ currentDate.strftime("%Y-%m-%d"))
        newClass = Task(
            user_id=user_id,
            name=data['name'],
            task_type='class',
            date=currentDate,
            start_time=initialClass.start_time,
            end_time=initialClass.end_time,
            priority=initialClass.priority,
            parent_id=initialClass.id
        )
        classTasks.append(newClass)
        dates[i % len(dates)] = currentDate + timedelta(days=7)
        i+= 1
        currentDate = dates[i % len(dates)]
        # initialClasses = [firstClass (Monday - 0), secondClass (Wednesday - 2), thirdClass (Friday- 4]

    db.session.add_all(classTasks) 
    db.session.commit()
    return jsonify({'message': 'Classes added!'})

@bp.route('/get_completed_tasks/<int:user_id>', methods=['GET'])
def get_completed_tasks(user_id):
    completed_tasks = Performance.query.filter_by(user_id=user_id).all()
    completed_task_ids = list(set([p.task_id for p in completed_tasks]))  # Use set to remove duplicates
    return jsonify(completed_task_ids)

@bp.route('/schedule/<int:user_id>/task/<int:task_id>/remove', methods=['DELETE'])
def remove_task(user_id, task_id):
    try:
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            return jsonify({'message': 'Task not found or does not belong to the user'}), 404
        '''
        # Remove related performance records
        performances = Performance.query.filter_by(task_id=task_id).all()
        for performance in performances:
            db.session.delete(performance)
        '''
        # Remove related child tasks
        if task.children:
            for child in task.children:
                db.session.delete(child)

        # Remove the main task
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task and all related child tasks removed'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting task: {str(e)}")
        return jsonify({'message': 'Error deleting task', 'error': str(e)}), 500
    
@bp.route('/schedule/<int:user_id>/task/<int:task_id>/update', methods=['PUT'])
def update_task(user_id, task_id):
    data = request.get_json()
    # print(data)
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    if 'start' in data:
        print("Start: ", data['start'])
        task.start_time = datetime.strptime(data['start'], '%Y-%m-%dT%H:%M:%S').time()
        task.date = datetime.strptime(data['start'], '%Y-%m-%dT%H:%M:%S').date()
    if 'end' in data:
        task.end_time = datetime.strptime(data['end'], '%Y-%m-%dT%H:%M:%S').time()
    # print(task)
    db.session.commit()
    return jsonify({'message': 'Task updated!'}), 200

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

    # Fetch updated schedule
    updated_schedule = populate(user.id)

    return jsonify({
        'message': f'Study plan for {task.name} created!',
        'updated_schedule': updated_schedule
    }), 200

@bp.route('/quotes', methods=['GET'])
def quotes():
    url = "http://api.forismatic.com/api/1.0/"
    params = {
        "method":"getQuote",
        "format":"json",
        "lang":"en",
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        try:
            data = response.json()
        except JSONDecodeError:
            # Attempting to fix an error that comes up
            fixed_json = response.text.replace('\\', '\\\\')
            data = json.loads(fixed_json)
        return jsonify({"quote": data["quoteText"], "author": data["quoteAuthor"] if data['quoteAuthor'] else "Unknown"})
    else:
        return jsonify({"error": "Failed to fetch quote"}), response.status_code

# Existing route for fetching performance tasks
@bp.route('/get_performance_tasks/<int:user_id>', methods=['GET'])
def get_performance_tasks(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    tasks = Task.query.filter(Task.user_id == user_id, Task.name != 'Sleep', Task.task_type != 'class').all()
    task_data = [
        {
            "id": task.id,
            "name": task.name,
            "date": task.date.isoformat(),
            "start": datetime.combine(task.date, task.start_time).isoformat() if task.start_time else None,
            "end": datetime.combine(task.date, task.end_time).isoformat() if task.end_time else None
        } 
        for task in tasks
    ]
    return jsonify(task_data)

@bp.route('/update_performance', methods=['POST'])
def update_performance():
    data = request.get_json()
    
    performance = Performance(
        user_id=data['user_id'],
        task_id=data['task_id'],
        performance_score=data.get('performance_score'),  # This will be None for study sessions
        study_score=data['study_score'],
        feeling=data['feeling'],
        study_duration=data['study_duration'],
        time_before_task=data['time_before_task'],
        day_of_week=data['day_of_week'],
        time_of_day=data['time_of_day']
    )
    
    try:
        db.session.add(performance)
        db.session.commit()
        return jsonify({'message': 'Performance updated successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating performance: {str(e)}")
        return jsonify({'message': 'Error updating performance', 'error': str(e)}), 500

# New route for fetching task hours
@bp.route('/get_task_hours/<int:user_id>', methods=['GET'])
def get_task_hours(user_id):
    tasks = Task.query.filter_by(user_id=user_id).all()
    main_tasks = {task.id: task for task in tasks if not task.name.startswith('Study for')}
    study_sessions = [task for task in tasks if task.name.startswith('Study for')]

    task_hours = {}
    for session in study_sessions:
        main_task_name = session.name[len('Study for '):]
        main_task = next((t for t in main_tasks.values() if t.name == main_task_name), None)
        if main_task:
            if main_task.id not in task_hours:
                task_hours[main_task.id] = 0
            duration = ((session.end_time - session.start_time).seconds) / 3600
            task_hours[main_task.id] += duration

    result = [{"task_name": main_tasks[id].name, "total_study_hours": hours} for id, hours in task_hours.items()]
    return jsonify(result)