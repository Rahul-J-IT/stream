// client/src/components/Auth/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // Import CSS for styling

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', form);
      setUser(res.data.user);
    } catch (err) {
      setMessage(err.response.data.error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
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
        <button type="submit" className="auth-button">Login</button>
      </form>
    </div>
  );
};

export default Login;
