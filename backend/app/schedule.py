import datetime
import pandas as pd
from collections import defaultdict
from app.models import Task, User, Performance
from backend.ml_model import optimize_study_plan

def populate(user_id):
    allTasks = Task.query.filter_by(user_id=user_id).order_by(Task.start_time).all()
    completed_tasks = Performance.query.filter_by(user_id=user_id).with_entities(Performance.task_id).all()
    completed_task_ids = [t.task_id for t in completed_tasks]
    
    response = []
    for task in allTasks:
        response.append({
            'id': task.id,
            'text': task.name,
            'start': datetime.datetime.combine(task.date, task.start_time).isoformat(),
            'end': datetime.datetime.combine(task.date, task.end_time).isoformat(),
            'priority': task.priority,
            'completed': task.id in completed_task_ids
        })
    return response

def getFreeTimes(user_id, date, preferred_study_time):
    # Query all tasks for the given user and date, ordered by start time
    if preferred_study_time == "morning":
        tasks = Task.query.filter_by(user_id=user_id, date=date).order_by(Task.start_time).all()
        # Initialize current_time to the start of the day (00:00:00)
        current_time = datetime.time(0, 0, 0)
    else:
        tasks = Task.query.filter_by(user_id=user_id, date=date).order_by(Task.start_time.desc()).all()
        # Initialize current_time to the end of the day (23:59:59)
        current_time = datetime.time(23, 59, 59)

    # Initialize a list to hold free time slots
    response = []

    # Iterate over each task for the given date
    for task in tasks:
        # Check if there is free time before the current task starts
        if preferred_study_time == "morning":
            if current_time < task.start_time:
                # Append the free time slot to the response list
                response.append((current_time, task.start_time))
            # Update current_time to be the end time of the current task
            current_time = max(current_time, task.end_time)
        else: 
            if task.end_time < current_time:
                # Append the free time slot to the response list
                response.append((task.end_time, current_time))
            # Update current_time to be the start time of the current task
            current_time = min(current_time, task.start_time)

    # Check if there is free time after the last task until the end of the day (23:59:59)
    if preferred_study_time == "morning":
        if current_time < datetime.time(23, 59, 59):
            # Append the free time slot to the response list
            response.append((current_time, datetime.time(23, 59, 59)))
    else:
        if current_time > datetime.time(0, 0, 0):
            # Append the free time slot to the response list
            response.append((datetime.time(0, 0, 0), current_time))

    # Return the list of free time slots for the given date
    return response



def generate_study_plan(user, task):
    today = datetime.datetime.now().date()
    future = task.date
    days = (future - today).days
    if days <= 0:
        days = 1  # Minimum one day to handle short time frames
    
    # Adjust the frequency and duration of study based on priority
    if task.priority.lower() == "high":
        study_interval = 1
        study_duration = 2  # 2 hours for high priority
    elif task.priority.lower() == "medium":
        study_interval = 2
        study_duration = 1.5  # 1.5 hours for medium priority
    else:  # Low priority
        study_interval = 3
        study_duration = 1  # 1 hour for low priority

    studySessions = []
    preferred_study_time = user.preferred_study_time.lower()

    for day in range(days):
        if day % study_interval == 0:  # Check if it's a day to schedule study based on priority
            study_date = today + datetime.timedelta(days=day)
            freeTimes = getFreeTimes(user.id, study_date, preferred_study_time)
            
            for start_time, end_time in freeTimes:
                slot_duration = (datetime.datetime.combine(datetime.date.min, end_time) - 
                                 datetime.datetime.combine(datetime.date.min, start_time)).seconds / 3600
                
                if slot_duration >= study_duration:
                    if preferred_study_time == "morning":
                        session_start = start_time
                        session_end = (datetime.datetime.combine(datetime.date.min, start_time) + 
                                       datetime.timedelta(hours=study_duration)).time()
                    else:
                        session_end = end_time
                        session_start = (datetime.datetime.combine(datetime.date.min, end_time) - 
                                         datetime.timedelta(hours=study_duration)).time()
                    
                    study = Task(
                        user_id=user.id, 
                        name="Study for " + task.name, 
                        task_type="Study", 
                        priority=task.priority,
                        date=study_date, 
                        start_time=session_start, 
                        end_time=session_end,
                        parent_id=task.id
                    )
                    studySessions.append(study)
                    break  # Break after scheduling a study session for the day

    return studySessions

def setSleep(user_id, sleep_hours):
    sleepHours = sleep_hours
    bedtime = datetime.datetime.combine(datetime.date.today(), datetime.time(0, 0, 0))
    wakeup = (bedtime + datetime.timedelta(hours=sleepHours)).time()
    bedtime = bedtime.time()
    n = 8 * 7 # defaults for 8 weeks
    date = datetime.date.today()
    sleeps = []
    for i in range(n):
        sleep = Task(
            user_id=user_id,
            name="Sleep",
            task_type="Sleep",
            priority=10,
            date=date+datetime.timedelta(days=i),
            start_time=bedtime,
            end_time=wakeup
        )
        sleeps.append(sleep)
    return sleeps