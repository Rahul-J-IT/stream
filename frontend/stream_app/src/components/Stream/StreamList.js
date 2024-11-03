// client/src/components/Stream/StreamList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Stream.css';

const StreamList = () => {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/streams');
        setStreams(res.data.streams);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStreams();
    
    // Refresh streams every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stream-list-container">
      <h2>Live Streams</h2>
      {streams.length === 0 ? (
        <p>No live streams available.</p>
      ) : (
        <div className="stream-grid">
          {streams.map((stream) => (
            <Link 
              to={`/stream/${stream.id}`} 
              className="stream-card" 
              key={stream.id}
            >
              <div className="stream-thumbnail">
                {/* You can add a thumbnail image here if available */}
                <div className="stream-overlay">
                  <span className={`status-indicator ${stream.isLive ? 'live' : 'offline'}`}>
                    {stream.isLive ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
              <div className="stream-info">
                <h3 className="stream-title">{stream.title}</h3>
                <p className="streamer-name">{stream.streamerUsername}</p>
                <p className="stream-details">
                  {stream.viewers || 0} viewers • {stream.category || 'No category'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreamList;
