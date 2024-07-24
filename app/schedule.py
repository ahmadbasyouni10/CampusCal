import datetime
import pandas as pd
from collections import defaultdict
from app.models import Task, User

def populate(user_id):
    allTasks = Task.query.filter_by(user_id=user_id).order_by(Task.start_time).all()
    response = []
    '''
    {
        id: 1,
        text: "Event 1",
        start: DayPilot.Date.today().addHours(9),
        end: DayPilot.Date.today().addHours(11),
      },
    '''
    for task in allTasks:
        response.append({
            'id': task.id,
            'text': task.name,
            'start': datetime.datetime.combine(task.date, task.start_time).isoformat(),
            'end': datetime.datetime.combine(task.date, task.end_time).isoformat(),
            'priority': task.priority

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

def generate_study_plan(user, task, best_plans):
    studySessions = []
    for plan in best_plans:
        study_date = task.date - datetime.timedelta(days=plan['days_before'])
        study_start = datetime.datetime.combine(study_date, datetime.time(plan['hour'], 0))
        study_end = study_start + datetime.timedelta(hours=plan['duration'])
        
        study = Task(
            user_id=user.id, 
            name="Study for " + task.name, 
            task_type="Study", 
            priority=task.priority,
            date=study_date, 
            start_time=study_start.time(), 
            end_time=study_end.time(),
            parent_id=task.id
        )
        studySessions.append(study)
    
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