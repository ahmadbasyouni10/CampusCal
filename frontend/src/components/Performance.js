import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Performance.css";

const Performance = ({ userId }) => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/schedule/${userId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    const feedback = prompt("How did you feel about this task? (1-10)");
    const performanceData = {
      user_id: userId,
      task_id: taskId,
      score: feedback,
    };

    try {
      await axios.post('http://localhost:5000/update_performance', performanceData);
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="performance-container">
      <h2>Task Performance</h2>
      {tasks.map((task) => (
        <div key={task.id} className="task-item">
          <p>{task.text}</p>
          <button onClick={() => handleCompleteTask(task.id)}>Mark as Complete</button>
        </div>
      ))}
    </div>
  );
};

export default Performance;