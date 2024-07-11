import datetime
import pandas as pd
from collections import defaultdict
from app.models import Task

def populate(user_id):
    # Query all tasks for the given user, ordered by start time
    allTasks = Task.query.filter_by(user_id=user_id).order_by(Task.start_time).all()
    
    # Initialize a dictionary to hold tasks by date
    response = defaultdict(list)
    
    # Populate the dictionary with tasks grouped by their date
    for task in allTasks:
        response[task.date].append((task.start_time, task.end_time, task.name, task.id))
    
    # Iterate over each date in the response dictionary
    for key in response:
        # Initialize currentTime to the start of the day
        currentTime = datetime.time(0, 0, 0)
        # Temporary list to hold time slots for the current date
        temp = []
        
        # Iterate over each task for the current date
        for i in range(len(response[key])):
            curr = response[key][i]  # Current task
            
            # Check if there is free time before the current task
            if currentTime <= curr[0]:  # curr[0] is the start time of the task
                # Append the free time slot to temp
                temp.append((currentTime, curr[0], "Free", -1))
            
            # Append the current task to temp
            temp.append(curr)
            
            # Update currentTime to the end time of the current task
            currentTime = max(currentTime, curr[1])  # curr[1] is the end time of the task
        
        # Check if there is free time after the last task until the end of the day
        if currentTime < datetime.time(23, 59, 59):
            # Append the free time slot to temp
            temp.append((currentTime, datetime.time(23, 59, 59)))
        
        # Update the response dictionary with the processed time slots for the current date
        response[key] = temp
    
    # Return the final response dictionary with all time slots for each date
    return response
    '''
    Find all the tasks that correspond to the user's schedule
    sort them by date and time
    have a dict where the keys are dates and values are a list of time slots (open, task/event)
    return the dict
    
    '''

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
    '''
    Block out exam time
    get date range from when the exam takes place to current date/time
    divide # of hours by # of days
    find all open time slots
    fill in a time slot for a day, if no available times go for the next day and add in missing hours
    To do this can insert each study session as a task with its parent being the exam, that way if they finish early then all the sessions can be accessed quickly to be deleted
    '''

    today = datetime.datetime.now().date()
    future = task.date
    days = (future - today).days

    if days <= 0:
        days = 1  # Minimum one day to handle short time frames

    if task.priority >= 8:
        days = days
    elif task.priority >= 6:
        days = max(days // 2, 1)  # Ensure at least one day
    else:
        days = max(days // 3, 1)  # Ensure at least one day

    totalStudy = task.study_time
    studyTime = totalStudy / days

    studySessions = []
    while today <= future:
        freeTimes = getFreeTimes(user.id, today)
        missed = False
        for times in freeTimes:
            length = (datetime.datetime.combine(datetime.date.min, times[1]) - datetime.datetime.combine(datetime.date.min, times[0])).seconds / 3600  # Length of the free time in hours
            if studyTime <= length:
                totalStudy -= studyTime
                missed = True
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
                break
        
        today = (today + datetime.timedelta(days=1)).date()
        if missed:
            remaining_days = max((future - today).days, 1)  # Ensure at least one day
            studyTime = totalStudy / remaining_days
    
    return studySessions