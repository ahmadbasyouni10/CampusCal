import React, { useState } from 'react';
import './Form.css';
import { useNavigate } from 'react-router-dom';

function Form() {
    const [numClasses, setNumClasses] = useState(0);
    const [classes, setClasses] = useState([]);
    const [isAthlete, setIsAthlete] = useState(false);
    const [athleteHours, setAthleteHours] = useState('');
    const [sleepHours, setSleepHours] = useState('');
    const [showClasses, setShowClasses] = useState(false); 
    const [isMorning, setIsMorning] = useState(false);
    const [willingToStudyHours, setWillingToStudyHours] = useState('');
    const navigate = useNavigate();

    // Update number of classes and reset state appropriately
    const handleNumClassesChange = (e) => {
        const newCount = parseInt(e.target.value, 10) || 0;
        setNumClasses(newCount);
        const newClasses = Array.from({ length: newCount }, (_, index) => {
            return classes[index] || { 
                className: '', 
                room: '', 
                startTimeHour: '1', 
                startTimeMinute: '00', 
                startTimeAmPm: 'AM', 
                endTimeHour: '1', 
                endTimeMinute: '00', 
                endTimeAmPm: 'AM' 
            };
        });
        setClasses(newClasses);
    };

    // Handle changes to class details, start and end times
    const handleClassChange = (index, field, value) => {
        const updatedClasses = [...classes];
        updatedClasses[index] = { ...updatedClasses[index], [field]: value };
        setClasses(updatedClasses);
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log({ classes, isAthlete, athleteHours, sleepHours, isMorning, willingToStudyHours });
        //navigate('/NAME'); to be input when merged
    };

    return (
        <div className="App">
            <h1 style={{ textAlign: 'center', backgroundColor: 'darkcyan', color: 'white' }}>CampusCal</h1>
            <h3 className="center">Student scheduling has never been easier</h3>
            <div className="center">Help us get to know you</div>
            <div className="test">
                <p>How many classes are you taking?</p>
                <input type="number" value={numClasses} onChange={handleNumClassesChange} min="1" max="7" />
                <button onClick={() => setShowClasses(true)}>Get Started</button>
            </div>
            {showClasses && (
            <form onSubmit={handleSubmit}>
                {classes.map((cls, index) => (
                    <div key={index} className="input-group">
                        <strong>Class {index + 1}</strong>
                        <p>Class Name: <input type="text" value={cls.className} onChange={e => handleClassChange(index, 'className', e.target.value)} /></p>
                        <p>Room: <input type="text" value={cls.room} onChange={e => handleClassChange(index, 'room', e.target.value)} /></p>
                        <p>Start Time:
                            <select style = {{margin:0}} value={cls.startTimeHour} onChange={e => handleClassChange(index, 'startTimeHour', e.target.value)}>
                                {generateTimeOptions(12)}
                            </select>:
                            <select value={cls.startTimeMinute} onChange={e => handleClassChange(index, 'startTimeMinute', e.target.value)}>
                                {generateMinuteOptions()}
                            </select>
                            <select value={cls.startTimeAmPm} onChange={e => handleClassChange(index, 'startTimeAmPm', e.target.value)}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </p>
                        <p>End Time:
                            <select style = {{margin:0}} value={cls.endTimeHour} onChange={e => handleClassChange(index, 'endTimeHour', e.target.value)}>
                                {generateTimeOptions(12)}
                            </select>:
                            <select value={cls.endTimeMinute} onChange={e => handleClassChange(index, 'endTimeMinute', e.target.value)}>
                                {generateMinuteOptions()}
                            </select>
                            <select value={cls.endTimeAmPm} onChange={e => handleClassChange(index, 'endTimeAmPm', e.target.value)}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </p>
                    </div>
                ))}
                <div className="test">
                    <p>Are you a student athlete?</p>
                    <input type="checkbox" checked={isAthlete} onChange={() => setIsAthlete(!isAthlete)} />
                    {isAthlete && (
                        <>
                            <p>Enter your weekly hour commitment:</p>
                            <input type="number" value={athleteHours} onChange={e => setAthleteHours(e.target.value)} min="1" max="20" />
                        </>
                    )}
                </div>
                <div className="test">
                    <p>How many hours of sleep do you intend to get everyday?</p>
                    <input type="number" value={sleepHours} onChange={e => setSleepHours(e.target.value)} min="1" max="12" />
                </div>
                <div className="test">
                    <p>Are you a morning or night person?</p>
                </div>
                <div className="test">
                    <p>Check for Morning, Leave Empty for Night</p>
                    <input type="checkbox" checked={isMorning} onChange={() => setIsMorning(!isMorning)} />
                </div>   
                <div className="test">
                    <p>How many hours are you willing to study a day?</p>
                    <input type="number" value={willingToStudyHours} onChange={e => setWillingToStudyHours(e.target.value)} min="1" max="12" />                    
                </div>
                <div className="test">
                <button type="submit" className="submit-button">Submit Schedule</button>
                </div>
                
            </form>
            )}
        </div>
    );
}

function generateTimeOptions(max) {
    let options = [];
    for (let i = 1; i <= max; i++) {
        options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
}

function generateMinuteOptions() {
    let options = [];
    for (let i = 0; i < 60; i += 5) {
        options.push(<option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>);
    }
    return options;
}

export default Form;
