import datetime
import pandas as pd
from collections import defaultdict
from app.models import Task

def populate(user_id):
    # What actually loads the schedule, will return all open and closed time slots by days
    allTasks = Task.query.filter_by(user_id=user_id).order_by(Task.start_time).all()
    response = defaultdict(list)
    for task in allTasks:
        response[task.date].append((task.start_time, task.end_time, task.name, task.id)) # Gets all the tasks to be linked together to their dates
 
    for key in response:
        currentTime = datetime.time(0, 0, 0)
        temp = []
        for i in range(len(response[key])):
            curr = response[key][i] # curr is the individial task in the current date
            if currentTime <= curr[0]: # curr[0] represents the task start time
                temp.append((currentTime, curr[0], "Free", -1)) # Free time, -1 is for consistency, just represents no task
            else:
                temp.append(curr) # puts in the current task
            currentTime = max(currentTime, curr[1]) # curr[1] is the task end time
        if currentTime < datetime.time(23, 59, 59):
            temp.append((currentTime, datetime.time(23, 59, 59)))
        response[key] = temp

    return response
    '''
    Find all the tasks that correspond to the user's schedule
    sort them by date and time
    have a dict where the keys are dates and values are a list of time slots (open, task/event)
    return the dict
    
    '''

def getFreeTimes(user_id, date):
    tasks = Task.query.filter_by(user_id=user_id, date=date).order_by(Task.start_time).all() # Gets the tasks for a certain day
    response = []
    current_time = datetime.time(0, 0 ,0)
    for task in tasks:
        if current_time < task.start_time: # Signifies a free period
            response.append((current_time, task.start_time))
        current_time = max(current_time, task.end_time)
    if current_time < datetime.time(23, 59, 59): # Makes sure to add the end of the day
        response.append((current_time, datetime.time(23, 59, 59)))
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
    # modify later to only start after this time
    today = datetime.datetime.now().isoformat()
    future = task.date
    days = (future - today).days

    if task.priority >= 8:
        days = days
    elif task.priority >= 6:
        days = days // 2
    else:
        days = days // 3

    totalStudy = task.study_time
    studyTime = days/totalStudy

    '''
    Edge cases
    Last day for studying has no free time, need to retroactivly update previous days
    '''
    studySessions = []
    while today < future:
        freeTimes = getFreeTimes(user.id, today)
        missed = False
        for times in freeTimes:
            length = times[1]-times[0] # Length of the free time
            if studyTime <= length:
                totalStudy-= studyTime
                missed = True
                study = Task(user_id=user.id, 
                             name="Study for "+task.name, 
                             task_type="Study", 
                             priority=task.priority,
                             date=today, 
                             start_time=times[0], 
                             end_time=times[0]+studyTime,
                             parent_id=task.id)
                studySessions.append(study)
                break
        
        today = (today+datetime.timedelta(days=1)).date().isoformat()
        if missed:
            studyTime = (future - today).days / totalStudy
    
    return studySessions # Add all of these to the database then repopulate
    # get user schedule from database
    # Block out studyTime hours for "days" days starting from today to the day before the exam

    # once this is done call the populate function again to refresh the schedule