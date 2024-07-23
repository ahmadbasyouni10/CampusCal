import unittest
from unittest.mock import patch, MagicMock
import datetime
from flask import Flask
from app import create_app, db
from app.models import Task, User
from app.schedule import populate, getFreeTimes, generate_study_plan, setSleep

class TestPopulateFunctions(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    #populate
    @patch('app.schedule.Task.query')
    def test_populate(self, mock_query):
        # Setup
        mock_task = MagicMock(spec=Task)
        mock_task.id = 1
        mock_task.name = "Test Task"
        mock_task.date = datetime.date(2024, 1, 1)
        mock_task.start_time = datetime.time(9, 0)
        mock_task.end_time = datetime.time(10, 0)
        mock_task.priority = "High"
        mock_query.filter_by.return_value.order_by.return_value.all.return_value = [mock_task]
        
        result = populate(1)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['text'], 'Test Task')

    #getFreeTimes
    @patch('app.schedule.Task.query')
    def test_getFreeTimes(self, mock_query):
        # Setup
        mock_task = MagicMock(spec=Task)
        mock_task.start_time = datetime.time(10, 0)
        mock_task.end_time = datetime.time(11, 0)
        mock_query.filter_by.return_value.order_by.return_value.all.return_value = [mock_task]
        
        result = getFreeTimes(1, datetime.date(2024, 1, 1))
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0][0], datetime.time(0, 0))
        self.assertEqual(result[1][1], datetime.time(23, 59, 59))

    #generate_study_plan
    @patch('app.schedule.getFreeTimes')
    @patch('app.models.Task.query')
    def test_generate_study_plan(self, mock_query, mock_free_times):
        # Setup
        user = MagicMock(spec=User)
        user.id = 1
        user.study_hours_per_day = 2
        
        task = MagicMock(spec=Task)
        task.date = datetime.date.today() + datetime.timedelta(days=9)
        task.priority = 'High'
        task.name = "Exam Prep"
        task.id = 99

        mock_free_times.return_value = [(datetime.time(9, 0), datetime.time(11, 0)) for _ in range(10)]

        result = generate_study_plan(user, task)
        self.assertEqual(len(result), 10) 
        self.assertEqual(result[0].name, "Study for Exam Prep")
        self.assertIsInstance(result[0], Task)
        self.assertEqual(result[0].start_time, datetime.time(9, 0))
        self.assertEqual(result[0].end_time, datetime.time(11, 0))

    #setSleep
    def test_setSleep(self):
        # Setup
        user_id = 1
        sleep_hours = 8
        
        result = setSleep(user_id, sleep_hours)
        self.assertEqual(len(result), 56)
        self.assertIsInstance(result[0], Task)
        self.assertEqual(result[0].name, "Sleep")
        self.assertEqual(result[0].start_time, datetime.time(0, 0))
        self.assertEqual(result[0].end_time, datetime.time(8, 0))
        self.assertEqual(result[0].priority, 10)

class IntegrationTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        
    #populate
    def test_populate_integration(self):
        task = Task(
            name="Test Task", 
            date=datetime.date(2024, 1, 1), 
            start_time=datetime.time(9, 0), 
            end_time=datetime.time(10, 0), 
            priority="High", 
            user_id=1
        )
        db.session.add(task)
        db.session.commit()

        result = populate(1)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['text'], 'Test Task')

    #getFreeTimes
    def test_getFreeTimes_integration(self):
        task = Task(
            name="Test Task",
            start_time=datetime.time(10, 0), 
            end_time=datetime.time(11, 0), 
            date=datetime.date(2024, 1, 1), 
            user_id=1
        )
        db.session.add(task)
        db.session.commit()

        result = getFreeTimes(1, datetime.date(2024, 1, 1))
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0][0], datetime.time(0, 0))
        self.assertEqual(result[1][1], datetime.time(23, 59, 59))

    #generate_study_plan
    def test_generate_study_plan_integration(self):
        user = User(
            id=1, 
            username='testuser', 
            password='testpass', 
            study_hours_per_day=2,
            sleep_hours=8,
            preferred_study_time='morning'
        )
        db.session.add(user)
        db.session.commit()

        task = Task(
            name="Exam Prep", 
            date=datetime.date.today() + datetime.timedelta(days=9), 
            priority='High', 
            user_id=1,
            start_time=datetime.time(9,0),
            end_time=datetime.time(11,0)
        )
        db.session.add(task)
        db.session.commit()

        result = generate_study_plan(user, task)
        self.assertEqual(len(result), 10)
        self.assertEqual(result[0].name, "Study for Exam Prep")
        self.assertIsInstance(result[0], Task)
        self.assertEqual(result[0].start_time, datetime.time(0, 0))
        self.assertEqual(result[0].end_time, datetime.time(2, 0))

    #setSleep
    def test_setSleep_integration(self):
        user = User(
            id=1,
            username='testuser', 
            password='testpass', 
            sleep_hours=8,
            study_hours_per_day=2,
            preferred_study_time='morning'
        )
        db.session.add(user)
        db.session.commit()

        result = setSleep(1, 8)
        self.assertEqual(len(result), 56)
        self.assertIsInstance(result[0], Task)
        self.assertEqual(result[0].name, "Sleep")
        self.assertEqual(result[0].start_time, datetime.time(0, 0))
        self.assertEqual(result[0].end_time, datetime.time(8, 0))
        self.assertEqual(result[0].priority, 10)

if __name__ == '__main__':
    unittest.main()
