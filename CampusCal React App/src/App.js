import './App.css';
import React, { useState, useRef } from 'react';
import Calendar from './components/Calendar';
import { DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import 'react-calendar/dist/Calendar.css';
import "./CalendarStyles.css";


export default function CalendarGfg() {
	const [config, setConfig] = useState({
        viewType: "Week",
        durationBarVisible: false
      });
      
      const calendarRef = useRef();
  
      const handleTimeRangeSelected = args => {
        calendarRef.current.control.update({
          startDate: args.day
        });
      }  

	return (
		<div>
			<h1> Calendar </h1>
            <Calendar/>

        </div>
    );
}


//goes inside main fucntion for App.js
//<button onClick={() => setButtonPopup(true)} color='teal'>Create Event</button>