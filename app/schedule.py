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

def getFreeTimes(user_id, date):
    # Query all tasks for the given user and date, ordered by start time
    tasks = Task.query.filter_by(user_id=user_id, date=date).order_by(Task.start_time).all()

    # Initialize a list to hold free time slots
    response = []

    # Initialize current_time to the start of the day (00:00:00)
    current_time = datetime.time(0, 0, 0)

    # Iterate over each task for the given date
    for task in tasks:
        # Check if there is free time before the current task starts
        if current_time < task.start_time:
            # Append the free time slot to the response list
            response.append((current_time, task.start_time))
        
        # Update current_time to be the end time of the current task
        current_time = max(current_time, task.end_time)

    # Check if there is free time after the last task until the end of the day (23:59:59)
    if current_time < datetime.time(23, 59, 59):
        # Append the free time slot to the response list
        response.append((current_time, datetime.time(23, 59, 59)))

    # Return the list of free time slots for the given date
    return response

def generate_study_plan(user, task):
    today = datetime.datetime.now().date()
    future = task.date
    days = (future - today).days
    if days <= 0:
        days = 1  # Minimum one day to handle short time frames
    
    # Adjust the frequency of study based on priority
    study_interval = 1  # Default to studying every day
    if task.priority == "High":
        study_interval = 1
    elif task.priority == "Medium":
        study_interval = max(days // 5, 1)  # Study less frequently for medium priority
    elif task.priority == "Low":
        study_interval = max(days // 3, 1)  # Study even less frequently for low priority

    totalStudy = user.study_hours_per_day * (days // study_interval)
    studyTime = user.study_hours_per_day

    studySessions = []
    study_day_counter = 0  # Counter to track when to schedule the next study session based on priority

    while today <= future:
        if study_day_counter % study_interval == 0:  # Check if it's a day to schedule study based on priority
            freeTimes = getFreeTimes(user.id, today)
            for times in freeTimes:
                length = (datetime.datetime.combine(datetime.date.min, times[1]) - datetime.datetime.combine(datetime.date.min, times[0])).seconds / 3600
                if studyTime <= length:
                    totalStudy -= studyTime
                    start_time = times[0]
                    end_time = (datetime.datetime.combine(datetime.date.min, times[0]) + datetime.timedelta(hours=studyTime)).time()
                    study = Task(
                        user_id=user.id, 
                        name="Study for " + task.name, 
                        task_type="Study", 
                        priority=task.priority,
                        date=today, 
                        start_time=start_time, 
                        end_time=end_time,
                        parent_id=task.id
                    )
                    studySessions.append(study)
                    break  # Break after scheduling a study session for the day

        today += datetime.timedelta(days=1)
        study_day_counter += 1
        remaining_days = max((future - today).days, 1)  # Ensure at least one day
        if remaining_days < days:  # Adjust study time if we're closer to the task date
            studyTime = totalStudy / remaining_days

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