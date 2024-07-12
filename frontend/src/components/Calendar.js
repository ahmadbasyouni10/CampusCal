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
                name: 'Priority',
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
        // console.log("Calendar User ID: ", userId);
      const response = await axios.get(`http://localhost:5000/schedule/${userId}`);
      // console.log(response)
      setEvents(response.data);
    } catch (error) {
      console.error(error);
    }
  
  }
  useEffect(() => {
    getTasks();

    fetchQuote();

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
          <div className={"quotes"}>
            {quote && (
                <div className="quote-item">
                    <p>{quote.quote}</p>
                    <p>- {quote.author}</p>
                </div>
            )}
            </div>
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
