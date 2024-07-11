import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Username:', username);
        console.log('Password:', password);
        navigate('/form');
    }
    
    return (
        <div className="log-form">
            <h2>Login to your account</h2>
            <form onSubmit = {handleSubmit}>
                <input type="text" title="username" placeholder="username" value = {username} onChange = {(e) => setUsername(e.target.value)} />
                <input type="password" title="password" placeholder="password" value = {password} onChange = {(e) => setPassword(e.target.value)} />
                <button type="submit" className="btn">Login</button>
            </form>
        </div>
    );
}

export default Login;
