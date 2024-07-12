// source: https://code.daypilot.org/27556/react-day-week-month-calendar

import React, { useEffect, useState } from 'react';
import {DayPilotCalendar, DayPilotMonth, DayPilotNavigator, DayPilot} from "@daypilot/daypilot-lite-react"
import Create from "./CreateEventButton.js";
import OLay from "./AddingOLay.js";
import "./Calendar.css";

const Calendar = () => {

    const [view, setView] = useState("Week");
    const [startDate, setStartDate] = useState(DayPilot.Date.today());
    const [events, setEvents] = useState([]);

    const [dayView, setDayView] = useState();
    const [weekView, setWeekView] = useState();
    const [monthView, setMonthView] = useState();

    const [selectedTimeRange, setSelectedTimeRange] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [duration, setDuration] = useState(0);

    const onTimeRangeSelected = (args) => {
        setSelectedTimeRange({
            start: args.start,
            end: args.end,
        });
        setModalVisible(true);
    };
    
    // Calculate duration whenever selectedTimeRange changes
    useEffect(() => {
        if (selectedTimeRange && selectedTimeRange.start && selectedTimeRange.end) {
            const start = new Date(selectedTimeRange.start);
            const end = new Date(selectedTimeRange.end);
            const diffMilliseconds = end - start;
            const diffHours = diffMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
            setDuration(diffHours);
        } else {
            setDuration(0); // Reset duration if selectedTimeRange is not provided or invalid
        }
    }, [selectedTimeRange]);

    const handleModalClose = (modalData) => {
        setModalVisible(false);
        if (modalData) {
            const newEvent = {
                start: selectedTimeRange.start,
                end: selectedTimeRange.end,
                text: modalData.name,
                type: modalData.Id,
                priority: modalData.priority,
                hours: modalData.hours,
                select: modalData.select,
            };
            setEvents([...events, newEvent]);
        }
        setSelectedTimeRange(null);
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

    /*const handleCreateAssessment = async () => {
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
    }; */

    return (
        <div className={"container"}>
            <div className={"toolbar"}>
                <button onClick={() => setStartDate(DayPilot.Date.today())} className={"standalone"}>Today</button>
                <div className={"toolbar-group"}>
                    <button onClick={() => setView("Day")} className={view === "Day" ? "selected" : ""}>Day</button>
                    <button onClick={() => setView("Week")} className={view === "Week" ? "selected" : ""}>Week</button>
                    <button onClick={() => setView("Month")} className={view === "Month" ? "selected" : ""}>Month</button>
                </div>
                <div className={"create"}>
                    <Create>
                        sx={{
                            background: "none",
                            color: "inherit",
                        }}
                    </Create>
                </div>
            </div>
            <div className={"tools"}>
                <div className={"left"}>
                    <div className={"navigator"}>
                        <DayPilotNavigator
                            selectMode={view}
                            showMonths={1}
                            skipMonths={1}
                            onTimeRangeSelected={args => setStartDate(args.day)}
                            events={events}
                        />
                    </div>
                </div>
                <div className={"content"}>
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
             {modalVisible && (
            <OLay
                Id="Assignment"
                trigger={true}
                onCloseModal={handleModalClose}
                timee={selectedTimeRange.start}
                dura={duration}
            />
        )}
        </div>
    );
}

export default Calendar;