import React, { useState } from 'react';
import './Login.css'; // Import CSS file for styling
import axios from 'axios';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { token } = response.data; // Assuming backend sends back a token
      localStorage.setItem('token', token); // Store token in localStorage
      onLogin(); // Notify parent component (e.g., App.js) about successful login
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
      <h2 className="login-header">Campus Cal</h2>

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