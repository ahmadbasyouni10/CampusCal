from datetime import datetime, timedelta
import random
import pandas as pd
from collections import defaultdict
from app.models import Task, User

def populate(user_id):
    user = User.query.get(user_id)
    if not user:
        return {'error': 'User not found'}
    
    tasks = Task.query.filter_by(user_id=user_id).all()
    schedule = []
    
    for task in tasks:
        schedule.append({
            'name': task.name,
            'priority': task.priority,
            'date': task.date.isoformat(),
            'start_time': task.start_time.isoformat() if task.start_time else None,
            'end_time': task.end_time.isoformat() if task.end_time else None,
            'task_type': task.task_type
        })
    
    return schedule

def generate_study_plan(user, task):
    study_sessions = []
    days_until_due = (task.date - datetime.now().date()).days
    
    for day in range(days_until_due):
        study_date = (datetime.now() + timedelta(days=day)).date().isoformat()
        study_sessions.append(Task(
            user_id=user.id,
            name=f"Study for {task.name}",
            task_type="Study",
            date=study_date,
            start_time=None,
            end_time=None,
            priority=1
        ))

    return study_sessions

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
            study_date = (datetime.now() + datetime.timedelta(days=random.randint(0, days_until_due))).date().isoformat()
            adjusted_plan.append({
                'task': task.name,
                'study_hours': study_hours_per_day,
                'date': study_date
            })
    
    return adjusted_plan