import datetime
import pandas as pd
from collections import defaultdict
<<<<<<< HEAD
# from models import Task, Schedule, User
from test import Task, Schedule, User
=======
from models import Task, Schedule
# from app import db

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True nullable=False)
    tasks = db.relationship('Task', backref='schedule', lazy=True)
>>>>>>> e58f932869500e434c5ae0984193d2aeba662a82
'''
What needs to be stored in a users Schedule:
Any events that need to be blocked out
Blocked out times for studying
 -For the blocked out times, link the task because if the task finishes early delete the rest
'''

def populate(schedule_Id):
    # What actually loads the schedule, will return all open and closed time slots by days
    schedule = Schedule.query.get_or_404(schedule_Id)
    allTasks = Task.query.filter_by(schedule_id=schedule.id).order_by(Task.start_time).all()
    response = defaultdict(list)
    for task in allTasks:
        response[task.date].append((task.start_time, task.end_time, task.name, task.id)) # Gets all the tasks to be linked together to their dates
 
    for key in response:
        currentTime = datetime.time(0, 0, 0)
        temp = []
        for i in range(len(response[key])):
            curr = response[key][i]
            if currentTime <= curr[0]:
                temp.append((currentTime, curr[0], "Free")) # Free time
            else:
                temp.append(curr)
            currentTime = max(currentTime, curr[1])
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

def update():
    pass
    # calls other update functions depending on what was inputted

def getFreeTimes(schedule_id, date):
    schedule = Schedule.query.get_or_404(schedule_id) # Gets the Schedule
    tasks = Task.query.filter_by(schedule_id=schedule.id, date=date).order_by(Task.start_time).all() # Gets the tasks for a certain day
    response = []
    current_time = datetime.time(0, 0 ,0)
    for task in tasks:
        if current_time < task.start_time: # Signifies a free period
            response.append((current_time, task.start_time))
        current_time = max(current_time, task.end_time)
    if current_time < datetime.time(23, 59, 59): # Makes sure to add the end of the day
        response.append((current_time, datetime.time(23, 59, 59)))
    return response

def updateExams(schedule_id, exam):

    '''
    Block out exam time
    get date range from when the exam takes place to current date/time
    divide # of hours by # of days
    find all open time slots
    fill in a time slot for a day, if no available times go for the next day and add in missing hours
    To do this can insert each study session as a task with its parent being the exam, that way if they finish early then all the sessions can be accessed quickly to be deleted

    '''
    today = datetime.datetime.now()
    future = exam["date"]
    days = (future - today).days
    print(days)
    totalStudy = exam["hours"]
    studyTime = days/totalStudy
    schedule = Schedule.query.get_or_404(schedule_id)

    '''
    Edge cases
    Last day for studying has no free time, need to retroactivly update previous days
    '''
    studySessions = []
    while today < future:
        freeTimes = getFreeTimes(schedule_id, today)
        tookFlag = False
        for times in freeTimes:
            length = times[1]-times[0] # Length of the free time
            if studyTime <= length:
                totalStudy-= studyTime
                tookFlag = True
<<<<<<< HEAD
                study = Task(user_id=schedule.user_id, name="Study for "+exam["name"], task_type="Study", priority=exam["priority"],
=======
                study = Task(user_id=schedule.user_id, name=f"Study for {exam["name"]}", task_type="Study", priority=exam["priority"],
>>>>>>> e58f932869500e434c5ae0984193d2aeba662a82
                             date=today, start_time=times[0], end_time=times[0]+studyTime)
                studySessions.append(study)
                break
        
        today+= datetime.timedelta(days=1)
        if not tookFlag:
            studyTime = (future - today).days / totalStudy
    
    return studySessions # Add all of these to the database then repopulate
    # get user schedule from database
    # Block out studyTime hours for "days" days starting from today to the day before the exam

    # once this is done call the populate function again to refresh the schedule
    
'''
Storing the Schedule
dates as keys
dict {
    2024-07-09: {#timeRanges as Keys}

}

'''

test_exam = {
    "name": "CS288 Midterm",
    "date": datetime.datetime(2024, 8, 9, 11, 30),
    "time": "11:30 am",
    "hours": 20,
    "priority": 1,
    "class": "CS 288"
<<<<<<< HEAD
}   
=======
}
updateExams(test_exam)
>>>>>>> e58f932869500e434c5ae0984193d2aeba662a82
