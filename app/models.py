# models.py
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

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(50), nullable=True)  # e.g., class, exam, activity
    priority = db.Column(db.String(100), default="None")  # Priority LOW/MEDIUM/HIGH
    date = db.Column(db.Date, nullable=False)
    performance = db.Column(db.Float, nullable=True)
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    children = db.relationship('Task')

    def __repr__(self):
        return f"Task('{self.name}', '{self.date}')"