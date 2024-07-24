from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_login import UserMixin
from app import db

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    sleep_hours = db.Column(db.Integer, default=8)
    other_commitments = db.Column(db.Text)
    study_hours_per_day = db.Column(db.Integer, default=2)
    preferred_study_time = db.Column(db.String(20), default="morning")  # 'morning' or 'night'
    tasks = db.relationship('Task', backref='user', lazy=True)
    performances = db.relationship('Performance', backref='user', lazy=True)

    def __repr__(self):
        return f"User('{self.username}')"

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(50), nullable=True)  # e.g., class, exam, activity, study
    priority = db.Column(db.String(20), default="Medium")  # Priority LOW/MEDIUM/HIGH
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    children = db.relationship('Task', backref=db.backref('parent', remote_side=[id]))
    performances = db.relationship('Performance', backref='task', lazy=True, cascade="delete, delete-orphan")

    def __repr__(self):
        return f"Task('{self.name}', '{self.date}')"

class Performance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    performance_score = db.Column(db.Float, nullable=True)  # Change this to nullable=True
    study_score = db.Column(db.Float, nullable=False)
    feeling = db.Column(db.String(20), nullable=True)
    study_duration = db.Column(db.Float, nullable=False)
    time_before_task = db.Column(db.Float, nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)
    time_of_day = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"Performance(Task: '{self.task_id}', Score: '{self.performance_score}')"