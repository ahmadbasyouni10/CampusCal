// source: https://code.daypilot.org/27556/react-day-week-month-calendar

import React, { useEffect, useRef, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotMonth, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";


const Calendar = ({ userId }) => {
  const [view, setView] = useState("Week");
  const [startDate, setStartDate] = useState(DayPilot.Date.today());
  const [events, setEvents] = useState([]);
  const dayViewRef = useRef(null);
  const weekViewRef = useRef(null);
  const monthViewRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch(`http://localhost:5000/schedule/${userId}/events`);
      const data = await response.json();
      const formattedEvents = data.map(event => ({
        id: event.id,
        text: event.name,
        start: `${event.date}T${event.start_time}`,
        end: `${event.date}T${event.end_time}`,
        backColor: event.priority === 'High' ? '#ff0000' : event.priority === 'Low' ? '#00ff00' : '#0000ff',
      }));
      setEvents(formattedEvents);
    };

    fetchEvents();
  }, [userId]);

  const onTimeRangeSelected = async (args) => {
    const dp = args.control;
    const eventName = await DayPilot.Modal.prompt("Create a new event:", "Event Name");
    const eventPriority = await DayPilot.Modal.prompt("Priority:", "Normal");
    dp.clearSelection();
    if (eventName.canceled || eventPriority.canceled) {
      return;
    }
    const e = {
      start: args.start,
      end: args.end,
      text: eventName.result,
      priority: eventPriority.result,
    };
    setEvents([...events, e]);

    const startDate = new Date(args.start);
    const endDate = new Date(args.end);

    const isoStartDate = startDate.toISOString();
    const isoEndDate = endDate.toISOString(); 

    const date = isoStartDate.substring(0, 10);


    const start_time = isoStartDate.substring(11, 19);

    const end_time = isoEndDate.substring(11, 19);

    await fetch('http://localhost:5000/add_assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        name: eventName.result,
        priority: eventPriority.result,
        date: date,
        start_time: start_time,
        end_time: end_time,
      }),
    });
  };

  const handleCreateAssessment = () => {
    // Define what happens when the button is clicked.
    // If this function is unnecessary, remove the button reference from the render.
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
          ref={dayViewRef}
        />
        <DayPilotCalendar
          viewType={"Week"}
          startDate={startDate}
          events={events}
          visible={view === "Week"}
          durationBarVisible={false}
          onTimeRangeSelected={onTimeRangeSelected}
          ref={weekViewRef}
        />
        <DayPilotMonth
          startDate={startDate}
          events={events}
          visible={view === "Month"}
          eventBarVisible={false}
          onTimeRangeSelected={onTimeRangeSelected}
          ref={monthViewRef}
        />
      </div>
    </div>
  );
}

export default Calendar;