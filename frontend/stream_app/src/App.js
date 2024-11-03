// client/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import CreateStream from './components/Stream/CreateStream';
import StreamList from './components/Stream/StreamList';
import ViewStream from './components/Stream/ViewStream';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <Router>
        <div className="auth-navigation">
          <Link to="/">Login</Link> | <Link to="/register">Register</Link>
        </div>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login setUser={setUser} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <nav className="main-navigation">
        <Link to="/streams">Live Streams</Link>
        {user.role === 'streamer' && <Link to="/create-stream">Create Stream</Link>}
        <span className="welcome-message">Welcome, {user.username}</span>
      </nav>
      <Routes>
        <Route path="/create-stream" element={<CreateStream user={user} />} />
        <Route path="/streams" element={<StreamList />} />
        <Route path="/stream/:id" element={<ViewStream user={user} />} />
        <Route path="*" element={<Navigate to="/streams" />} />
      </Routes>
    </Router>
  );
};

export default App;
