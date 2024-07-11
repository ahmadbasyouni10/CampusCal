import React, { useState, useRef } from 'react';
import Calendar from './components/Calendar';
import { DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import 'react-calendar/dist/Calendar.css';
import './App.css';

export default function CalendarGfg() {
	return (
		<div class="primary">
			<h1>CampusCal </h1>
            <Calendar/>
        </div>
    );
}

//

//goes inside main fucntion for App.js
//<button onClick={() => setButtonPopup(true)} color='teal'>Create Event</button>
