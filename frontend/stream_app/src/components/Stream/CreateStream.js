// client/src/components/Stream/CreateStream.js

import React, { useState } from 'react';
import axios from 'axios';
import './Stream.css'; // Import CSS for styling
import { useNavigate } from 'react-router-dom';
import CreateEventPage from './CreateEvent';
const CreateStream = ({ user }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/streams', { title, streamerId: user.id });
      setMessage('Stream created successfully');
      navigate(`/stream/${res.data.stream.id}`);
    } catch (err) {
      setMessage(err.response.data.error);
    }
  };

  return (
    <>
    <div className="stream-container">
      <h2>Create Stream</h2>
      {message && <p className="stream-message">{message}</p>}
      <form onSubmit={handleSubmit} className="stream-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Stream Title"
          required
          className="stream-input"
        />
        <button type="submit" className="stream-button">Start Streaming</button>
      </form>
    </div>
    <>
    <CreateEventPage />
    </>
    </>
  );
};

export default CreateStream;
