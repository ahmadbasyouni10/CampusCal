# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_login import UserMixin
from app import db

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    sleep_hours = db.Column(db.Integer, nullable=False, default=8)
    other_commitments = db.Column(db.Text, nullable=True)
    schedule = db.relationship('Schedule', uselist=False, backref='owner', lazy=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(50), nullable=False)  # e.g., class, exam, activity
    priority = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)

    def __repr__(self):
        return f"Task('{self.name}', '{self.date}')"

class Performance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    score = db.Column(db.Float, nullable=True)
    completion_time = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f"Performance('{self.user_id}', '{self.task_id}')"

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    tasks = db.relationship('Task', backref='schedule', lazy=True)
