from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Import CORS
import os
from dotenv import load_dotenv

# Initialize SQLAlchemy
db = SQLAlchemy()
load_dotenv()
def create_app():
    app = Flask(__name__)
    app.config['DEBUG'] = True 

    # Load environment variables
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///CampusCal.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'mysecret')

    # Apply CORS to the entire app
    CORS(app, resources={r"/*": {"origins": "*"}})  # This allows all origins, adjust as needed

    # Initialize extensions
    db.init_app(app)

    # Import and register blueprints
    from app.routes import bp as login_bp
    app.register_blueprint(login_bp)

    with app.app_context():
        db.create_all()

    return app