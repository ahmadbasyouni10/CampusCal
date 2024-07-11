import React from "react";
import { useState } from "react";
import "./Form.css";
import { useNavigate } from "react-router-dom";

const RegistrationForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [studyHoursPerDay, setStudyHoursPerDay] = useState("");
  const [otherCommitments, setOtherCommitments] = useState("");
  const [preferredStudyTime, setPreferredStudyTime] = useState("morning");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Assuming you have an API endpoint for registration and login
    const registrationUrl = "http://localhost:5000/register";
    const loginUrl = "http://localhost:5000/login";
    const userData = {
      username,
      password,
    };

    try {
      // Registration request
      const registrationResponse = await fetch(registrationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!registrationResponse.ok) {
        throw new Error(`HTTP error! status: ${registrationResponse.status}`);
      }

      const loginResponse = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!loginResponse.ok) {
        throw new Error(`HTTP error! status: ${loginResponse.status}`);
      }

      // Assuming the login response includes a token or session data
      const loginData = await loginResponse.json();
      // Store the token/session data as needed, e.g., in localStorage
      localStorage.setItem("userToken", loginData.token);
      onLogin(); // Notify parent component (e.g., App.js) about successful login

      // Redirect to homepage using navigate
      navigate("/"); // Adjust the path as per your routing setup
    } catch (error) {
      console.error("Registration or login failed:", error);
      // Handle error scenario (e.g., displaying an error message)
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="sleepHours">Preferred Sleep Hours:</label>
          <input
            type="number"
            id="sleepHours"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="studyHoursPerDay">Study Hours Per Day:</label>
          <input
            type="number"
            id="studyHoursPerDay"
            value={studyHoursPerDay}
            onChange={(e) => setStudyHoursPerDay(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="otherCommitments">Other Commitments:</label>
          <textarea
            id="otherCommitments"
            value={otherCommitments}
            onChange={(e) => setOtherCommitments(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="preferredStudyTime">Preferred Study Time:</label>
          <select
            id="preferredStudyTime"
            value={preferredStudyTime}
            onChange={(e) => setPreferredStudyTime(e.target.value)}
            required
          >
            <option value="morning">Morning</option>
            <option value="night">Night</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
