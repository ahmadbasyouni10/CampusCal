import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import "./Performance.css";

const Performance = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [taskDurations, setTaskDurations] = useState({});
  const [taskRatings, setTaskRatings] = useState({});
  const [studyRatings, setStudyRatings] = useState({});
  const [feelings, setFeelings] = useState({});
  const [colors, setColors] = useState({});

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/schedule/${userId}`);
      processTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const processTasks = (tasks) => {
    const taskMap = {};
    const colorMap = {};

    tasks.forEach((task, index) => {
      if (taskMap[task.name]) {
        taskMap[task.name].duration += (new Date(task.end) - new Date(task.start)) / (1000 * 60 * 60); // Convert to hours
      } else {
        taskMap[task.name] = {
          ...task,
          duration: (new Date(task.end) - new Date(task.start)) / (1000 * 60 * 60)
        };
        colorMap[task.id] = `hsl(${360 * index / tasks.length}, 70%, 60%)`; // Assign color
      }
    });

    setTasks(Object.values(taskMap));
    setTaskDurations(Object.fromEntries(Object.entries(taskMap).map(([k, v]) => [v.id, v.duration])));
    setColors(colorMap);
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
      await axios.post('http://localhost:5000/update_performance', ratingData);
      alert("Performance updated successfully!");
    } catch (error) {
      console.error("Error updating performance:", error);
    }
  };

  const getPieData = () => {
    const labels = tasks.map(task => task.name);
    const data = tasks.map(task => taskDurations[task.id]);

    const backgroundColor = tasks.map(task => colors[task.id]);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor,
      }],
    };
  };

  return (
    <div className="performance-container">
      <h2>Performance Overview</h2>
      <div className="pie-chart">
        <Pie data={getPieData()} />
      </div>
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item" style={{ borderColor: colors[task.id] }}>
            <h3 style={{ color: colors[task.id] }}>{task.name}</h3>
            <p>Total Hours: {taskDurations[task.id].toFixed(2)}</p>
            <div className="ratings-form">
              <label>Rate Task:
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={taskRatings[task.id] || ""}
                  onChange={(e) => setTaskRatings({ ...taskRatings, [task.id]: e.target.value })}
                />
              </label>
              <label>Rate Study Session:
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={studyRatings[task.id] || ""}
                  onChange={(e) => setStudyRatings({ ...studyRatings, [task.id]: e.target.value })}
                />
              </label>
              <label>Feeling:
                <select
                  value={feelings[task.id] || ""}
                  onChange={(e) => setFeelings({ ...feelings, [task.id]: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="happy">😊 Happy</option>
                  <option value="sad">😞 Sad</option>
                </select>
              </label>
              <button onClick={() => handleSubmit(task.id)}>Submit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Performance;