import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///CampusCal.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'mysecret')

db = SQLAlchemy(app)

from app.routes import bp as auth_bp
app.register_blueprint(auth_bp, url_prefix='/auth')

def create_app():
    with app.app_context():
        db.create_all()
    return app