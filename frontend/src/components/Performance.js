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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/schedule/${userId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
      await axios.post('http://localhost:5000/update_performance', ratingData);
      alert("Performance updated successfully!");
    } catch (error) {
      console.error("Error updating performance:", error);
    }
  };

  const getPieData = () => {
    const labels = tasks.map(task => task.name);
    const data = tasks.map(task => {
      const duration = new Date(task.end) - new Date(task.start);
      return duration / (1000 * 60 * 60); // Convert to hours
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
      }],
    };
  };

  return (
    <div className="performance-container">
      <h2>Performance</h2>
      <div className="pie-chart">
        <Pie data={getPieData()} />
      </div>
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <p>{task.name}</p>
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
