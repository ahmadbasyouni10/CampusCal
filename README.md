# CampusCal

College students involve themselves in a variety of activities, whether that be academic, extracurricular, or otherwise. Too many college students overwhelm their schedules without taking a look at how realistic their commitments are, which leads to stress and burnout. Through CampusCal, college students will be much less overwhelmed about their time management skills, which will lead to an increase in overall well-being and academic performance. 
## Getting Started
Clone this repository in your development folder.
```bash
git clone <repo_url> 
```
### Development Setup Instructions
The following instructions are taioled for OSX(Mac) users. However, Linux/Windows should have very similar commands.  

To start our frontend, from the root directory:

```bash
cd frontend
npm install react-scripts
npm start
```
To start our backend, in a new terminal, from the root directory:

```bash
cd app
pip install virtualenv
pip install Flask-SQLAlchemy
pip install flask-cors
pip install flask-login
pip install pandas
pip install requests
virtualenv test
source test/bin/activate
flask --app __init__ run -p 8000 --reload
```
## How to run locally

After installing the mentioned dependancies:

Frontend:
```bash
npm start
```

Backend:
```bash
flask --app __init__ run -p 8000 --reload
```

## Style
If not already installed, you can install, upgrade, and uninstall [pycodestyle](https://pypi.org/project/pycodestyle/) with these commands. 

```bash
pip install pycodestyle
pip install --upgrade pycodestyle
pip uninstall pycodestyle
```

To run the style checker statically from the terminal:

```bash
pycodestyle --first file_name.py
```

Code pushed have automatic style checking. 

## Early Sketches

![image](https://github.com/ahmadbasyouni10/CampusCal/assets/120362910/593fcbbf-3bac-41e3-a734-435e4f381983)

![image](https://github.com/ahmadbasyouni10/CampusCal/assets/120362910/69b4485f-7b24-4b44-a767-0ecb827fce54)

## Built With

* [Python](https://www.python.org/doc/) - Used for calendar processing
* [React](https://react.dev/) - The web framework used
* [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/en/3.1.x/) - Used to store user input (login, schedule, study plans)
