import React, { useState } from 'react';
import './Login.css'; // Import CSS file for styling
import axios from 'axios';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const url = window.location.protocol +"//" + window.location.hostname;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}:8000/login`, { username, password }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { token, user_id } = response.data; // Assuming backend sends back a token
      localStorage.setItem('token', token); // Store token in localStorage
      localStorage.setItem('userId', user_id);
      // console.log("Local Storage User ID: ", localStorage.getItem('userId'));

      onLogin(); // Notify parent component (e.g., App.js) about successful login
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="login-container2">
      <form onSubmit={handleSubmit}>
      <h2 className="register-header">Campus Cal</h2>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;