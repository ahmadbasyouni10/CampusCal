import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import "./Performance.css";

const Performance = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [studyRatings, setStudyRatings] = useState({});
  const [taskRatings, setTaskRatings] = useState({});
  const [feelings, setFeelings] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchTasks();
    fetchCompletedTasks();
  }, [userId]);
  
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${url}/get_performance_tasks/${userId}`);
      console.log("Fetched tasks:", response.data);
      const formattedTasks = response.data.map(task => ({
        ...task,
        date: new Date(task.date),
        start: new Date(task.start),
        end: new Date(task.end)
      }));
      setAllTasks(formattedTasks);
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks for performance:", error);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const response = await axios.get(`${url}/get_completed_tasks/${userId}`);
      setCompletedTasks(response.data);
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
    }
  };

  const handleStudyRatingChange = (taskId, rating) => {
    setStudyRatings({ ...studyRatings, [taskId]: rating });
  };

  const handleTaskRatingChange = (taskId, rating) => {
    setTaskRatings({ ...taskRatings, [taskId]: rating });
  };

  const handleFeelingChange = (taskId, feeling) => {
    setFeelings({ ...feelings, [taskId]: feeling });
  };

  const handleSubmit = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error("Task not found");
      return;
    }
  
    const startTime = task.start;
    const endTime = task.end;
    const taskDate = task.date;
  
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || isNaN(taskDate.getTime())) {
      console.error("Invalid date or time", { start: task.start, end: task.end, date: task.date });
      return;
    }
  
    const ratingData = {
      user_id: userId,
      task_id: taskId,
      study_score: parseFloat(studyRatings[taskId]) || 0,
      feeling: feelings[taskId] || '',
      study_duration: (endTime - startTime) / (1000 * 60 * 60), // in hours
      time_before_task: (taskDate - startTime) / (1000 * 60 * 60 * 24), // in days
      day_of_week: startTime.getDay(),
      time_of_day: startTime.getHours() + startTime.getMinutes() / 60, // 0-24 format
    };
  
    if (!task.name.startsWith('Study for ')) {
      ratingData.performance_score = parseFloat(taskRatings[taskId]) || 0;
    }
  
    try {
      const response = await axios.post(`${url}/update_performance`, ratingData);
      console.log("Server response:", response.data);
      alert("Performance updated successfully!");
      setCompletedTasks(prev => [...prev, taskId]);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Clear the ratings and feelings for the submitted task
      setStudyRatings(prev => {
        const newRatings = {...prev};
        delete newRatings[taskId];
        return newRatings;
      });
      setTaskRatings(prev => {
        const newRatings = {...prev};
        delete newRatings[taskId];
        return newRatings;
      });
      setFeelings(prev => {
        const newFeelings = {...prev};
        delete newFeelings[taskId];
        return newFeelings;
      });
    } catch (error) {
      console.error("Error updating performance:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      alert("Failed to update performance. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    if (!(date instanceof Date) || isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString();
  };

  const groupTasksByMainTask = (tasks) => {
    const grouped = {};
    tasks.forEach(task => {
      const mainTaskName = task.name.startsWith('Study for ') ? task.name.slice(10) : task.name;
      if (!grouped[mainTaskName]) {
        grouped[mainTaskName] = [];
      }
      grouped[mainTaskName].push(task);
    });
    return grouped;
  };

  const getPieData = (taskData) => {
    const labels = taskData.map(task => `${task.name} (${formatDate(task.start)})`);
    const data = taskData.map(task => {
      if (!(task.start instanceof Date) || !(task.end instanceof Date)) return 0;
      return (task.end - task.start) / (1000 * 60 * 60);
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
      }],
    };
  };

  const groupedTasks = groupTasksByMainTask(allTasks);

  const renderTaskForm = (task) => {
    const isMainTask = !task.name.startsWith('Study for ');
    const isCompleted = completedTasks.includes(task.id);

    if (isCompleted) return null;

    return (
      <div key={task.id} className="task-item">
        <p>{task.name} ({formatDate(task.start)})</p>
        <label>
          Rate Study Session:
          <input
            type="number"
            min="1"
            max="10"
            value={studyRatings[task.id] || ""}
            onChange={(e) => handleStudyRatingChange(task.id, e.target.value)}
            required
          />
        </label>
        {isMainTask && (
          <label>
            Rate Task:
            <input
              type="number"
              min="1"
              max="10"
              value={taskRatings[task.id] || ""}
              onChange={(e) => handleTaskRatingChange(task.id, e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Feeling:
          <select
            value={feelings[task.id] || ""}
            onChange={(e) => handleFeelingChange(task.id, e.target.value)}
            required
          >
            <option value="">Select</option>
            <option value="happy">😊 Happy</option>
            <option value="sad">😞 Sad</option>
          </select>
        </label>
        <button 
          onClick={() => handleSubmit(task.id)}
          disabled={!studyRatings[task.id] || (isMainTask && !taskRatings[task.id]) || !feelings[task.id]}
        >
          Submit
        </button>
      </div>
    );
  };

  return (
    <div className="performance-container">
      <h2>Performance</h2>
      <div className="completed-tasks">
        <h3>Completed Tasks</h3>
        <ul>
          {completedTasks.map(taskId => {
            const task = allTasks.find(t => t.id === taskId) || {};
            return (
              <li key={taskId} className="completed-task">
                <span>{task.name || 'Unknown Task'}</span>
                <span>{formatDate(task.date)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="pie-charts-grid">
        {Object.entries(groupedTasks).map(([mainTaskName, taskData]) => (
          <div key={mainTaskName} className="pie-chart-container">
            <h3>{mainTaskName}</h3>
            <div className="pie-chart">
              {taskData.length > 0 ? (
                <Pie 
                  data={getPieData(taskData)} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              ) : (
                <p>No data available for this chart</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="task-forms-grid">
        {Object.entries(groupedTasks).map(([mainTaskName, taskData]) => {
          const studySessions = taskData.filter(task => task.name.startsWith('Study for '));
          const mainTask = taskData.find(task => !task.name.startsWith('Study for '));

          return (
            <div key={mainTaskName}>
              {studySessions.map(renderTaskForm)}
              {studySessions.every(session => completedTasks.includes(session.id)) && mainTask && !completedTasks.includes(mainTask.id) && renderTaskForm(mainTask)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Performance;