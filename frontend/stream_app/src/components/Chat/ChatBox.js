// client/src/components/Chat/ChatBox.js

import React, { useState, useEffect } from 'react';
import './ChatBox.css'; // Import CSS for styling

const ChatBox = ({ socket, streamId, username }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('newChatMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('newChatMessage');
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chatMessage', { streamId, message, username });
      setMessage('');
    }
  };

  return (
    <div className="chatbox-container">
      <h3>Live Chat</h3>
      <div className="chatbox-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chatbox-message">
            <strong>{msg.username}: </strong>{msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chatbox-form">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          required
          className="chatbox-input"
        />
        <button type="submit" className="chatbox-button">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;
