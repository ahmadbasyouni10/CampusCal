import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Form from './Form';
import Login from './Login';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Form" element={<Form />} />
            </Routes>
        </Router>
    );
}

export default App;