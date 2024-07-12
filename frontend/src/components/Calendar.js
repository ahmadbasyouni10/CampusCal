// source: https://code.daypilot.org/27556/react-day-week-month-calendar

import React, { useEffect, useRef, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotMonth, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";

const Calendar = ({ userId }) => {
  const [view, setView] = useState("Week");
  const [startDate, setStartDate] = useState(DayPilot.Date.today());
  const [tasks, setTasks] = useState([]);

  const [dayView, setDayView] = useState();
  const [weekView, setWeekView] = useState();
  const [monthView, setMonthView] = useState();

  const onTimeRangeSelected = async (args) => {
    const dp = args.control;
    const taskName = await DayPilot.Modal.prompt("Create a new task:", "Task Name");
    const taskPriority = await DayPilot.Modal.prompt("Priority:", "Normal");
    dp.clearSelection();
    if (taskName.canceled || taskPriority.canceled) {
      return;
    }
    const newTask = {
      start: args.start,
      end: args.end,
      text: taskName.result,
      priority: taskPriority.result,
      userId: userId
    };
    setTasks([...tasks, newTask]);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch(`http://localhost:5000/schedule/${userId}>/events`);
      const data = await response.json();
      setTasks(data);
    };

    fetchTasks();
  }, [userId]);

  const handleCreateTask = async () => {
    const form = [
      { name: "Name", id: "name" },
      { name: "Priority", id: "priority", type: "select", options: ["High", "Normal", "Low"], defaultValue: "Normal" },
      { name: "Start Date and Time", id: "start", type: "datetime-local", dateFormat: "YYYY-MM-DDTHH:MM" },
      { name: "End Date and Time", id: "end", type: "datetime-local", dateFormat: "YYYY-MM-DDTHH:MM" }
    ];

    const modal = await DayPilot.Modal.form(form, "Create New Task");
    if (modal.canceled) return;

    const { name, priority, start, end } = modal.result;

    const newTask = {
      start: start,
      end: end,
      text: name,
      priority: priority,
      userId: userId
    };

    setTasks(tasks => [...tasks, newTask]);
  };

  return (
    <div className={"container"}>
      <div className={"navigator"}>
        <DayPilotNavigator
          selectMode={view}
          showMonths={1}
          skipMonths={1}
          onTimeRangeSelected={args => setStartDate(args.day)}
        />
        <button onClick={handleCreateTask} className="create-task-btn">Create Task</button>
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
          events={tasks}
          visible={view === "Day"}
          durationBarVisible={false}
          onTimeRangeSelected={onTimeRangeSelected}
          controlRef={setDayView}
        />
        <DayPilotCalendar
          viewType={"Week"}
          startDate={startDate}
          events={tasks}
          visible={view === "Week"}
          durationBarVisible={false}
          onTimeRangeSelected={onTimeRangeSelected}
          controlRef={setWeekView}
        />
        <DayPilotMonth
          startDate={startDate}
          events={tasks}
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