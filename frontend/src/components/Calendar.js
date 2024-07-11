// source: https://code.daypilot.org/27556/react-day-week-month-calendar

import React, { useEffect, useRef, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotMonth, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";

const Calendar = () => {

  const [view, setView] = useState("Week");
  const [startDate, setStartDate] = useState(DayPilot.Date.today());
  const [events, setEvents] = useState([]);

  const [dayView, setDayView] = useState();
  const [weekView, setWeekView] = useState();
  const [monthView, setMonthView] = useState();

  const onTimeRangeSelected = async (args) => {
    const dp = args.control;
    const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
    dp.clearSelection();
    if (modal.canceled) {
      return;
    }
    const e = {
      start: args.start,
      end: args.end,
      text: modal.result
    };
    setEvents([...events, e]);
  };

  useEffect(() => {

    const data = [
      {
        id: 1,
        text: "Event 1",
        start: DayPilot.Date.today().addHours(9),
        end: DayPilot.Date.today().addHours(11),
      },
      {
        id: 2,
        text: "Event 2",
        start: DayPilot.Date.today().addHours(10),
        end: DayPilot.Date.today().addHours(12),
        backColor: "#93c47d",
        borderColor: "darker"
      },
      {
        id: 9,
        text: "Event 9",
        start: DayPilot.Date.today().addHours(13),
        end: DayPilot.Date.today().addHours(15),
        backColor: "#76a5af", // Teal background
        borderColor: "darker"
      },
      {
        id: 3,
        text: "Event 3",
        start: DayPilot.Date.today().addDays(1).addHours(9),
        end: DayPilot.Date.today().addDays(1).addHours(11),
        backColor: "#ffd966", // Yellow background
        borderColor: "darker"
      },
      {
        id: 4,
        text: "Event 4",
        start: DayPilot.Date.today().addDays(1).addHours(11).addMinutes(30),
        end: DayPilot.Date.today().addDays(1).addHours(13).addMinutes(30),
        backColor: "#f6b26b", // Orange background
        borderColor: "darker"
      },

      {
        id: 7,
        text: "Event 7",
        start: DayPilot.Date.today().addDays(1).addHours(14),
        end: DayPilot.Date.today().addDays(1).addHours(16),
        backColor: "#e691b8", // Pink background
        borderColor: "darker"
      },
      {
        id: 5,
        text: "Event 5",
        start: DayPilot.Date.today().addDays(4).addHours(9),
        end: DayPilot.Date.today().addDays(4).addHours(11),
        backColor: "#8e7cc3", // Purple background
        borderColor: "darker"
      },
      {
        id: 6,
        text: "Event 6",
        start: DayPilot.Date.today().addDays(4).addHours(13),
        end: DayPilot.Date.today().addDays(4).addHours(15),
        backColor: "#6fa8dc", // Light Blue background
        borderColor: "darker"
      },

      {
        id: 8,
        text: "Event 8",
        start: DayPilot.Date.today().addDays(5).addHours(13),
        end: DayPilot.Date.today().addDays(5).addHours(15),
        backColor: "#b6d7a8", // Light Green background
        borderColor: "darker"
      },

    ];

    setEvents(data);

  }, []);

  const handleCreateAssessment = async () => {
    const modal = await DayPilot.Modal.prompt("Create a new assessment:", "Assessment Name");
    if (modal.canceled) {
      return;
    }
  
    // Use DayPilot.Date.today() to get the current date and format it in ISO 8601 format
    const start = new DayPilot.Date(DayPilot.Date.today()).toString("yyyy-MM-ddTHH:mm:ss");
    // Add 2 hours to the start time for the end time and format it
    const end = new DayPilot.Date(start).addHours(2).toString("yyyy-MM-ddTHH:mm:ss");
  
    const newEvent = {
      start: start,
      end: end,
      text: modal.result
    };
  
    setEvents(events => [...events, newEvent]);
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
        start: startTime,
        end: endTime,
        text: modal.result.name
        };
    
        setEvents(events => [...events, newEvent]);
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <div className={"container"}>
      <div className={"navigator"}>
        <DayPilotNavigator
          selectMode={view}
          showMonths={1}
          skipMonths={1}
          onTimeRangeSelected={args => setStartDate(args.day)}
          events={events}
        />
        <button onClick={handleCreateAssessment} className="create-assessment-btn">Create Assessment</button>
        <button onClick={createClass} className="create-class-btn">Create Class</button>
      </div>
      <div className={"content"}>
        <div className={"toolbar"}>
          <div className={"toolbar-group"}>
            <button onClick={() => setView("Day")} className={view === "Day" ? "selected" : ""}>Day</button>
            <button onClick={() => setView("Week")} className={view === "Week" ? "selected" : ""}>Week</button>
            <button onClick={() => setView("Month")} className={view === "Month" ? "selected" : ""}>Month</button>
          </div>
          <button onClick={() => setStartDate(DayPilot.Date.today())} className={"standalone"}>Today</button>
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
  );
}
export default Calendar;
