// client/src/components/Auth/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // Import CSS for styling

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '', role: 'viewer' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', form);
      setMessage('Registration successful. You can now log in.');
    } catch (err) {
      setMessage(err.response.data.error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {message && <p className="auth-message">{message}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="auth-input"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="auth-input"
        />
        <select name="role" value={form.role} onChange={handleChange} className="auth-select">
          <option value="viewer">Viewer</option>
          <option value="streamer">Streamer</option>
        </select>
        <button type="submit" className="auth-button">Register</button>
      </form>
    </div>
  );
};

export default Register;
