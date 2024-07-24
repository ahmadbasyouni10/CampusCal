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

    const url = window.location.protocol + "//" + window.location.hostname;

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

            const data = {
                name: "Assessment",
                priority: "Low",
                plan: false
            }
            // modal_custom css file is in frontend/src/themes/modal_custom.css
            const properties = {
                theme: "modal_custom",
                okText: "Submit",
                cancelText: "Cancel"
            }
            const modal = await DayPilot.Modal.form(form, data, properties)
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
            const response = await axios(`${url}:8000/add_assessment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(e)
            });

            if (modal.result.plan == true) {
                // /schedule/<int:user_id>/task/<int:task_id>/new_study_plan
                await axios.post(`${url}:8000/schedule/${userId}/task/${response.data.task_id}/new_study_plan`, {
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
            const response = await axios.get(`${url}:8000/quotes`);
            setQuote(response.data)
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    };

    const getTasks = async () => {
        try {
            const response = await axios.get(`${url}:8000/schedule/${userId}`);
            console.log("Tasks from backend: ", response.data);
            const tasksWithColors = response.data.map((task) => {
                // Debugging: Log the priority value received from the backend
                console.log("Priority from backend:", task.priority);

                const priorityColorMap = {
                    "High": '#C13333', // Soft Red #ff6b6b
                    "Medium": '#F1A80B', // Gold #f0a500
                    "Low": '#0A600E' // Soft Green
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

    const [tasksWithColors, setTasksWithColors] = useState([]);

    const daily = async () => {
        try {
            const response = await axios.get(`${url}:8000/schedule/${userId}`);

            const currentDate = new DayPilot.Date(startDate)

            const priorityColorMap = {
                "High": '#C13333', 
                "Medium": '#F1A80B',
                "Low": '#0A600E'
            };

            const tasksWithColorsStr = response.data
                .filter(task => {
                    const taskDate = new DayPilot.Date(task.startTime); 
                    return taskDate.toString("M/d/yyyy") === currentDate.toString("M/d/yyyy") && task.id > 88;
                })
                .map((task) => {
                    const color = priorityColorMap[task.priority] || 'rgba(173, 216, 230, 0.5)';
                    const startTimeFormatted = new DayPilot.Date(task.startTime).toString("hh:mm tt");
                    const endTimeFormatted = new DayPilot.Date(task.endTime).toString("hh:mm tt");

                    console.log(startTimeFormatted, endTimeFormatted );
                    return {
                        task: task.text,
                        priority: task.priority,
                        color: color,
                        start: startTimeFormatted,
                        end: endTimeFormatted
                    };
                });

            //debugging to make sure it sends the correct tasks
            console.log("startDate:", startDate, "tasks:", tasksWithColorsStr);
            setTasksWithColors(tasksWithColorsStr);

        } catch (error) {
            console.error(error);
        }
    };

    const deleteTask = async (args) => {
        console.log("Delete Task Args: ", args.e.data);
        const modal = await DayPilot.Modal.confirm("Would you like to delete this task? This action cannot be undone. If a study plan was created for this task then all study sessions will also be removed",
            { theme: "modal_custom" }
        );
        if (modal.canceled) {
            return;
        }

        try {
            const response = await axios.delete(`${url}:8000/schedule/${userId}/task/${args.e.data.id}/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(response)
            await getTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const createClass = async () => {
        const form = [
            { name: "Class Name", id: "name", required: true, type: 'text', cssClass: 'form-input' },
            { name: "Starting Time", id: "startTime", required: true, timeFormat: "HH:mm", type: 'time', cssClass: 'form-input' },
            { name: "Ending Time", id: "endTime", required: true, timeFormat: "HH:mm", type: 'time', cssClass: 'form-input' },
            { name: "Start Date", id: "start", required: true, dateFormat: "MM/dd/yyyy", type: "date", cssClass: 'form-input' },
            { name: "End Date", id: "end", required: true, dateFormat: "MM/dd/yyyy", type: "date", cssClass: 'form-input' },
            { name: "Sunday", id: 'sunday', type: 'checkbox', cssClass: 'form-checkbox' },
            { name: "Monday", id: 'monday', type: 'checkbox', cssClass: 'form-checkbox' },
            { name: "Tuesday", id: 'tuesday', type: 'checkbox', cssClass: 'form-checkbox' },
            { name: "Wednesday", id: 'wednesday', type: 'checkbox', cssClass: 'form-checkbox' },
            { name: "Thursday", id: 'thursday', type: 'checkbox', cssClass: 'form-checkbox' },
            { name: "Friday", id: 'friday', type: 'checkbox', cssClass: 'form-checkbox' },
            { name: "Saturday", id: 'saturday', type: 'checkbox', cssClass: 'form-checkbox' },
        ]
        const data = {
            name: "Linear Algebra",
            startTime: "08:30",
            endTime: "10:00",
            start: "2024-09-06",
            end: "2024-12-18",
            sunday: false,
            monday: true,
            tuesday: false,
            wednesday: true,
            thursday: false,
            friday: false,
            saturday: false
        }
        const properties = {
            name: "Create Class",
            theme: "modal_custom",
            okText: "Submit",
            cancelText: "Cancel"
        }
        const modal = await DayPilot.Modal.form(form, data, properties);
        if (modal.canceled) {
            return;
        }
        try {


            // Use DayPilot.Date.today() to get the current date and format it in ISO 8601 format
            const startDate = new DayPilot.Date(modal.result.start, "MM/dd/yyyy").toString("yyyy-MM-dd");
            // Add 2 hours to the start time for the end time and format it
            const endDate = new DayPilot.Date(modal.result.end, "MM/dd/yyyy").toString("yyyy-MM-dd");

            const startDateTime = `${startDate}T${modal.result.startTime}:00`;
            const endDateTime = `${endDate}T${modal.result.endTime}:00`;

            // const startTime = new DayPilot.Date(startDateTime, "HH:mm").toString("HH:mm:ss");
            // const endTime = new DayPilot.Date(endDateTime, "HH:mm").toString("HH:mm:ss");

            const newEvent = {
                name: modal.result.name,
                userId: userId,
                start: startDateTime,
                end: endDateTime,
                startDate: startDate,
                endDate: endDate,
                days: {
                    sunday: modal.result.sunday,
                    monday: modal.result.monday,
                    tuesday: modal.result.tuesday,
                    wednesday: modal.result.wednesday,
                    thursday: modal.result.thursday,
                    friday: modal.result.friday,
                    saturday: modal.result.saturday
                }
            };
            console.log(newEvent)

            const response = await axios(`http://localhost:8000/schedule/${userId}/classes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(newEvent)
            });
            console.log("Class Created!")
            await getTasks();
        } catch (error) {
            console.log("Error in Creating class" + error);
        }
    };


    useEffect(() => {
        getTasks();
        fetchQuote();
        daily();
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

    const onBeforeHeaderRender = (args) => {
        args.header.html = args.column.start.toString("dddd");
    };

    return (
        <div className={"container"}>

            <div className={"content"}>
                <div className={"toolbar"}>
                    <div className={"toolbargroups"}>
                        <div className={"toolbar-group"}>
                            <button onClick={() => setView("Day")} className={view === "Day" ? "selected" : ""}>Day</button>
                            <button onClick={() => setView("Week")} className={view === "Week" ? "selected" : ""}>Week</button>
                            <button onClick={() => setView("Month")} className={view === "Month" ? "selected" : ""}>Month</button>
                        </div>
                        <button onClick={() => setStartDate(DayPilot.Date.today())} className={"standalone"}>Today</button>
                    </div>
                    <h1 className='titleee'> CampusCal</h1>
                    <span className="slogan">  - Optimize Learning</span>
                    <div className={"quotes"}>
                        {quote && (
                            <div className="quote-item">
                                <p>{quote.quote}</p>
                                <p>- {quote.author}</p>
                            </div>
                        )}
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
                        <div className="planner">
                            <br/>
                            <h2>Today's Agenda</h2>
                            <div className={"agenda"}>
                                {tasksWithColors.length > 0 ? (
                                    tasksWithColors.map((taskstr, index) => (
                                        <div key={index}>
                                            <div>{taskstr.start} - {taskstr.end}</div>
                                            <div>{taskstr.task}</div>
                                            <br />
                                        </div>
                                    ))
                                ) : (
                                    <div> No plans for today! </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DayPilotCalendar
                        viewType={"Day"}
                        startDate={startDate}
                        events={events}
                        visible={view === "Day"}
                        durationBarVisible={false}
                        onTimeRangeSelected={onTimeRangeSelected}
                        onEventClick={deleteTask}
                        controlRef={setDayView}
                    />
                    <DayPilotCalendar
                        viewType={"Week"}
                        startDate={startDate}
                        events={events}
                        visible={view === "Week"}
                        durationBarVisible={false}
                        onTimeRangeSelected={onTimeRangeSelected}
                        onEventClick={deleteTask}
                        controlRef={setWeekView}
                        onBeforeHeaderRender={onBeforeHeaderRender}
                    />
                    <DayPilotMonth
                        startDate={startDate}
                        events={events}
                        visible={view === "Month"}
                        eventBarVisible={false}
                        onTimeRangeSelected={onTimeRangeSelected}
                        onEventClick={deleteTask}
                        controlRef={setMonthView}
                    />
                </div>
            </div>
        </div >
    );
}
export default Calendar;
