// source: https://code.daypilot.org/27556/react-day-week-month-calendar

import React, { useEffect, useRef, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotMonth, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";
import axios from 'axios';

const Calendar = ({ userId }) => {

  const [view, setView] = useState("Week");
  const [startDate, setStartDate] = useState(DayPilot.Date.today());
  const [events, setEvents] = useState([]);
  const [quote, setQuote] = useState([]);

  const [dayView, setDayView] = useState();
  const [weekView, setWeekView] = useState();
  const [monthView, setMonthView] = useState();

  const onTimeRangeSelected = async (args) => {
    try {
        const dp = args.control;
        const form = [
            {
            name: 'Event Name',
            id: 'name',
            type: 'text',
            },
            {
                name: 'Priority Low/Medium/High',
                id: 'priority',
                type: 'text',
            },
            {
            type: 'checkbox',
            id: 'plan',
            name: 'Would you like to create a study plan?',
            }
        ];
        const modal = await DayPilot.Modal.form(form)
        dp.clearSelection();
        if (modal.canceled) {
        return;
        }

        const e = {
        user_id: userId,
        name: modal.result.name,
        priority: modal.result.priority,
        date: args.start.toString("yyyy-MM-dd"),
        start: args.start,
        end: args.end,
        performance: null
        };
        const response = await axios('http://localhost:5000/add_assessment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(e)
        });

        if (modal.result.plan == true) {
            // /schedule/<int:user_id>/task/<int:task_id>/new_study_plan
            await axios.post(`http://localhost:5000/schedule/${userId}/task/${response.data.task_id}/new_study_plan`, {
                headers: {
                    'Content-Type': 'application/json',
                }
        });
        }
        await getTasks();
    } catch (e) {
        console.error("In onTimeRangeSelected Error: ", e);
    }
  };


  const fetchQuote = async () => {
    try {
        const response = await axios.get('http://localhost:5000/quotes');
        setQuote(response.data)
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
  };

  const getTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/schedule/${userId}`);
      console.log("Tasks from backend: ", response.data);
      const tasksWithColors = response.data.map((task) => {
        // Debugging: Log the priority value received from the backend
        console.log("Priority from backend:", task.priority);
        
        const priorityColorMap = {
          "High": 'red',
          "Medium": 'orange',
          "Low": 'green'
        };
        // Ensure case-insensitive comparison and trim spaces
        const color = priorityColorMap[task.priority] || 'rgba(173, 216, 230, 0.5)';
        return {
          ...task,
          backColor: color
        };
      });
      console.log("Tasks with colors: ", tasksWithColors);
      setEvents(tasksWithColors);
    } catch (error) {
      console.error(error);
    }
  };

  const createClass = async () => {
    const form = [
        {name: "Class Name", id: "name", required: true, type: 'text'},
        {name: "Starting Time", id: "startTime", required: true, timeFormat: "HH:mm",  type: 'time'},
        {name: "Ending Time", id: "endTime", required: true, timeFormat: "HH:mm",  type: 'time'},
        {name: "Start Date", id: "start", required: true, dateFormat: "MM/dd/yyyy", type: "date"},
        {name: "End Date", id: "end", required: true, dateFormat: "MM/dd/yyyy", type: "date"},
        {name: "Monday", id: 'monday', type: 'checkbox'},
        {name: "Tuesday", id: 'tuesday', type: 'checkbox'},
        {name: "Wednesday", id: 'wednesday', type: 'checkbox'},
        {name: "Thursday", id: 'thursday', type: 'checkbox'},
        {name: "Friday", id: 'friday', type: 'checkbox'},
    ]
    const modal = await DayPilot.Modal.form(form);
    console.log("Modal:", modal);
    if (modal.canceled) {
      return;
    }
    try {


        // Use DayPilot.Date.today() to get the current date and format it in ISO 8601 format
        const startDate = new DayPilot.Date(modal.result.start, "MM/dd/yyyy").toString("yyyy-MM-dd");
        // Add 2 hours to the start time for the end time and format it
        const endDate = new DayPilot.Date(modal.result.end, "MM/dd/yyyy").toString("yyyy-MM-dd");

        const startTime = new DayPilot.Date(modal.result.startTime, "HH:mm:ss").toString("HH:mm:ss");
        const endTime = new DayPilot.Date(modal.result.endTime, "HH:mm:ss").toString("HH:mm:ss");

        const newEvent = {
            name: modal.result.name,
            userId: userId,
            start: startTime,
            end: endTime,
            startDate: startDate,
            endDate: endDate,
            days: {
                monday: modal.result.monday,
                tuesday: modal.result.tuesday,
                wednesday: modal.result.wednesday,
                thursday: modal.result.thursday,
                friday: modal.result.friday
            }
        };

        const response = await axios(`http://localhost:5000/schedule/${userid}/classes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(e)
        });

        await getTasks();
    } catch (error) {
        console.log(error);
    }
  };


  useEffect(() => {
    getTasks();
    fetchQuote();

  }, []);

  const handleCreateAssessment = async () => {
    const modal = await DayPilot.Modal.prompt("Create a new assessment:", "Assessment Name");
    if (modal.canceled) {
      return;
    }

    const now = new DayPilot.Date();
    const start = new DayPilot.Date(DayPilot.Date.today()).toString("yyyy-MM-ddTHH:mm:ss");
    const end = new DayPilot.Date(start).addHours(2).toString("yyyy-MM-ddTHH:mm:ss");

    if (start < now.String("yyyy-MM-ddTHH:mm:ss")) {
      alert("Cannot create an event in the past");
      return;
    }
  
    const newEvent = {
      start: start,
      end: end,
      text: modal.result
    };
  
    setEvents(events => [...events, newEvent]);
  };

  return (
    <div className={"container"}>
      
      <div className={"content"}>
        <div className={"toolbar"}>
        <h1 className='titleee'>CampusCal</h1>
          <div className={"toolbargroups"}>
          <div className={"toolbar-group"}>
            <button onClick={() => setView("Day")} className={view === "Day" ? "selected" : ""}>Day</button>
            <button onClick={() => setView("Week")} className={view === "Week" ? "selected" : ""}>Week</button>
            <button onClick={() => setView("Month")} className={view === "Month" ? "selected" : ""}>Month</button>
          </div>
          <button onClick={() => setStartDate(DayPilot.Date.today())} className={"standalone"}>Today</button>
          <div className={"quotes"}>
            {quote && (
                <div className="quote-item">
                    <p>{quote.quote}</p>
                    <p>- {quote.author}</p>
                </div>
            )}
            </div>
        </div>
      </div>

      <div className='top'>
      <div className={"navigator"}>
        <DayPilotNavigator
          selectMode={view}
          showMonths={1}
          skipMonths={1}
          onTimeRangeSelected={args => setStartDate(args.day)}
          events={events}
        />
        <button onClick={createClass} className="create-class-btn">Create Class</button>
      </div>

        <DayPilotCalendar
          viewType={"Day"}
          startDate={startDate}
          events={events}
          visible={view === "Day"}
          durationBarVisible={false}
          onTimeRangeSelected={onTimeRangeSelected}
          controlRef={setDayView}
        />
        <DayPilotCalendar
          viewType={"Week"}
          startDate={startDate}
          events={events}
          visible={view === "Week"}
          durationBarVisible={false}
          onTimeRangeSelected={onTimeRangeSelected}
          controlRef={setWeekView}
        />
        <DayPilotMonth
          startDate={startDate}
          events={events}
          visible={view === "Month"}
          eventBarVisible={false}
          onTimeRangeSelected={onTimeRangeSelected}
          controlRef={setMonthView}
        />
      </div>
      </div>
    </div>
  );
}
export default Calendar;
