import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import "./Performance.css";

const Performance = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [taskRatings, setTaskRatings] = useState({});
  const [studyRatings, setStudyRatings] = useState({});
  const [feelings, setFeelings] = useState({});
  const url = window.location.protocol + "//" + window.location.hostname;

  useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${url}:5000/get_performance_tasks/${userId}`);
      console.log("Fetched tasks:", response.data);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks for performance:", error);
    }
  };

  const handleTaskRatingChange = (taskId, rating) => {
    setTaskRatings({ ...taskRatings, [taskId]: rating });
  };

  const handleStudyRatingChange = (taskId, rating) => {
    setStudyRatings({ ...studyRatings, [taskId]: rating });
  };

  const handleFeelingChange = (taskId, feeling) => {
    setFeelings({ ...feelings, [taskId]: feeling });
  };

  const handleSubmit = async (taskId) => {
    const ratingData = {
      user_id: userId,
      task_id: taskId,
      score: taskRatings[taskId],
      study_score: studyRatings[taskId],
      feeling: feelings[taskId],
    };

    try {
      await axios.post(`${url}:5000/update_performance`, ratingData);
      alert("Performance updated successfully!");
    } catch (error) {
      console.error("Error updating performance:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log("Missing date string");
      return "N/A";
    }
    
    if (/^\d{2}:\d{2}:\d{2}$/.test(dateString)) {
      const today = new Date();
      const [hours, minutes, seconds] = dateString.split(':');
      today.setHours(hours, minutes, seconds);
      return today.toLocaleString();
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log("Invalid date string:", dateString);
      return "Invalid Date";
    }
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
      const startTime = new Date(`1970-01-01T${task.start}`);
      const endTime = new Date(`1970-01-01T${task.end}`);
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.log("Invalid date for task:", task);
        return 0;
      }
      const duration = (endTime - startTime) / (1000 * 60 * 60);
      return duration;
    });

    console.log("Pie chart labels:", labels);
    console.log("Pie chart data:", data);

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

  const groupedTasks = groupTasksByMainTask(tasks);

  return (
    <div className="performance-container">
      <h2>Performance</h2>
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
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <p>{task.name} ({formatDate(task.start)})</p>
            <label>
              Rate Task:
              <input
                type="number"
                min="1"
                max="10"
                value={taskRatings[task.id] || ""}
                onChange={(e) => handleTaskRatingChange(task.id, e.target.value)}
              />
            </label>
            <label>
              Rate Study Session:
              <input
                type="number"
                min="1"
                max="10"
                value={studyRatings[task.id] || ""}
                onChange={(e) => handleStudyRatingChange(task.id, e.target.value)}
              />
            </label>
            <label>
              Feeling:
              <select
                value={feelings[task.id] || ""}
                onChange={(e) => handleFeelingChange(task.id, e.target.value)}
              >
                <option value="">Select</option>
                <option value="happy">😊 Happy</option>
                <option value="sad">😞 Sad</option>
              </select>
            </label>
            <button onClick={() => handleSubmit(task.id)}>Submit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Performance;