import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from app.models import Performance, Task, User
from app import db

def prepare_data():
    performances = Performance.query.all()
    data = []
    for p in performances:
        task = Task.query.get(p.task_id)
        user = User.query.get(p.user_id)
        data.append({
            'user_id': p.user_id,
            'task_type': task.task_type,
            'priority': task.priority,
            'study_duration': p.study_duration,
            'time_before_task': p.time_before_task,
            'day_of_week': p.day_of_week,
            'time_of_day': p.time_of_day,
            'performance_score': p.performance_score,
            'study_score': p.study_score,
            'sleep_hours': user.sleep_hours,
            'study_hours_per_day': user.study_hours_per_day,
        })
    return pd.DataFrame(data)

def train_model():
    df = prepare_data()
    if df.empty:
        print("No performance data available. Using default model.")
        return (RandomForestRegressor(n_estimators=100, random_state=42),
                RandomForestRegressor(n_estimators=100, random_state=42),
                None,
                ['user_id', 'study_duration', 'time_before_task', 'day_of_week', 'time_of_day', 'sleep_hours', 'study_hours_per_day'])

    X = df.drop(['performance_score', 'study_score'], axis=1)
    y_performance = df['performance_score']
    y_study = df['study_score']
    
    X_encoded = pd.get_dummies(X, columns=['task_type', 'priority'])
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_encoded)
    
    perf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    study_model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    perf_model.fit(X_scaled, y_performance)
    study_model.fit(X_scaled, y_study)
    
    return perf_model, study_model, scaler, X_encoded.columns

def predict_performance(model, scaler, feature_names, user, task, study_duration, time_before_task, day_of_week, time_of_day):
    features = pd.DataFrame({
        'user_id': [user.id],
        'study_duration': [study_duration],
        'time_before_task': [time_before_task],
        'day_of_week': [day_of_week],
        'time_of_day': [time_of_day],
        'sleep_hours': [user.sleep_hours],
        'study_hours_per_day': [user.study_hours_per_day],
        'task_type': [task.task_type],
        'priority': [task.priority]
    })
    
    features = pd.get_dummies(features, columns=['task_type', 'priority'])
    missing_cols = set(feature_names) - set(features.columns)
    for col in missing_cols:
        features[col] = 0
    features = features[feature_names]
    
    if scaler is not None:
        features_scaled = scaler.transform(features)
    else:
        features_scaled = features
    
    return model.predict(features_scaled)[0]

def optimize_study_plan(user, task):
    perf_model, study_model, scaler, feature_names = train_model()
    
    if scaler is None:
        print("No performance data available. Generating default study plan.")
        return [{'days_before': 3, 'day_of_week': 0, 'hour': 14, 'duration': 2}]
    
    best_plans = []
    
    for session_count in range(1, 4):  # Generate 1 to 3 study sessions
        best_performance = 0
        best_plan = None
        
        for days_before in range(1, 8):  # 1 to 7 days before
            for day_of_week in range(7):  # 0-6 for Monday-Sunday
                for hour in range(24):  # 0-23 hours
                    for duration in range(1, 5):  # 1 to 4 hours of study
                        try:
                            predicted_performance = predict_performance(
                                perf_model, scaler, feature_names, user, task,
                                duration, days_before, day_of_week, hour
                            )
                            predicted_study_score = predict_performance(
                                study_model, scaler, feature_names, user, task,
                                duration, days_before, day_of_week, hour
                            )
                        except Exception as e:
                            print(f"Error predicting performance: {e}")
                            continue
                        
                        overall_score = (predicted_performance + predicted_study_score) / 2
                        
                        if overall_score > best_performance:
                            best_performance = overall_score
                            best_plan = {
                                'days_before': days_before,
                                'day_of_week': day_of_week,
                                'hour': hour,
                                'duration': duration,
                            }
        
        if best_plan:
            best_plans.append(best_plan)
    
    return best_plans if best_plans else [{'days_before': 3, 'day_of_week': 0, 'hour': 14, 'duration': 2}]