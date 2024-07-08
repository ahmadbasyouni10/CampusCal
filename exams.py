import datetime
# each day has 24 hours, 12am - 11:59pm
def updateExams(exam):
    '''
    exam is a dict:
    name:
    date: 
    time:
    hours:
    priority:
    class?:
    '''
    '''
    Block out exam time
    get date range from when the exam takes place to current date/time
    divide # of hours by # of days
    find all open time slots
    fill in a time slot for a day, if no available times go for the next day and add in missing hours
    '''
    today = datetime.datetime.now()
    future = exam["date"]
    days = (future - today).days


    print(days)


test_exam = {
    "name": "CS288 Midterm",
    "date": datetime.datetime(2024, 8, 9, 11, 30),
    "time": "11:30 am",
    "hours": 20,
    "priority": 1,
    "class": "CS 288"
}
updateExams(test_exam)