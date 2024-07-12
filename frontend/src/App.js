import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import LoginForm from './components/Login';
import RegistrationForm from './components/Register';
import 'react-calendar/dist/Calendar.css';
import "./CalendarStyles.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    // console.log("App UserId: ", userId);
    if (token && userId) {
      setLoggedIn(true);
      setUserId(userId);
    }
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUserId(null);
  };

  return (
    <Router>
      <div className="App">
        <header>
          <nav>
            <ul>
              {loggedIn ? (
                <>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/" onClick={handleLogout} className='logout-button'>Logout</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Register</Link></li>
                </>
              )}
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={loggedIn ? <Calendar userId={localStorage.getItem('userId')} /> : <Navigate replace to="/login" />} />
          <Route path="/login" element={!loggedIn ? <LoginForm onLogin={handleLogin} /> : <Navigate replace to="/" />} />
          <Route path="/register" element={!loggedIn ? <RegistrationForm onLogin={handleLogin} /> : <Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;