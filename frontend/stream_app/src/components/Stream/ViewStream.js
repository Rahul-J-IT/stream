// client/src/components/Stream/ViewStream.js

import React, { useEffect, useRef, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import ChatBox from '../Chat/ChatBox';
import axios from 'axios';
import './Stream.css';

const ViewStream = ({ user }) => {
  const { id: streamId } = useParams();
  const socket = useContext(SocketContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareVideoRef = useRef(null);
  const [streamInfo, setStreamInfo] = useState(null);
  const [viewers, setViewers] = useState([]); // [{ viewerId, viewerSocketId }, ...]
  const peerConnections = useRef({}); // { socketId: RTCPeerConnection }
  const [chatMessages, setChatMessages] = useState([]);
  const [showViewers, setShowViewers] = useState(false);
  const [currentViewers, setCurrentViewers] = useState([]);

  useEffect(() => {
    // Fetch stream details
    const fetchStream = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/streams/${streamId}`);
        setStreamInfo(res.data.stream);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStream();

    // Join stream room
    socket.emit('joinStream', { streamId, userId: user.id });

    // Listen for viewer updates
    socket.on('updateViewers', ({ viewerId, viewerSocketId }) => {
      setViewers((prev) => {
        // Prevent duplicate viewers
        const exists = prev.some((v) => v.viewerId === viewerId);
        if (!exists) {
          return [...prev, { viewerId, viewerSocketId }];
        }
        return prev;
      });

      // Streamer initiates WebRTC offer to the new viewer
      if (user.role === 'streamer') {
        createOffer(viewerSocketId);
      }
    });

    // Handle incoming chat messages
    socket.on('newChatMessage', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Handle stream ended
    socket.on('streamEnded', ({ message }) => {
      alert(message);
      window.location.href = '/streams';
    });

    // WebRTC Signaling Handlers
    socket.on('webrtc-offer', handleReceiveOffer);
    socket.on('webrtc-answer', handleReceiveAnswer);
    socket.on('webrtc-ice-candidate', handleNewICECandidateMsg);

    // Handle viewer leaving
    socket.on('viewerLeft', ({ viewerId }) => {
      setViewers((prev) => prev.filter((v) => v.viewerId !== viewerId));
    });

    return () => {
      // Cleanup event listeners
      socket.off('updateViewers');
      socket.off('newChatMessage');
      socket.off('streamEnded');
      socket.off('webrtc-offer', handleReceiveOffer);
      socket.off('webrtc-answer', handleReceiveAnswer);
      socket.off('webrtc-ice-candidate', handleNewICECandidateMsg);
      socket.off('viewerLeft');
      // Close all peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
    };
  }, []);

  const handleReceiveOffer = async ({ offer, fromSocketId }) => {
    const pc = createPeerConnection(fromSocketId);
    peerConnections.current[fromSocketId] = pc;

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('webrtc-answer', { toSocketId: fromSocketId, answer });
  };

  const handleReceiveAnswer = async ({ answer, fromSocketId }) => {
    const pc = peerConnections.current[fromSocketId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleNewICECandidateMsg = async ({ candidate, fromSocketId }) => {
    const pc = peerConnections.current[fromSocketId];
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    }
  };

  const createPeerConnection = (socketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Google's public STUN server
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', { toSocketId: socketId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        pc.close();
        delete peerConnections.current[socketId];
      }
    };

    return pc;
  };

  const createOffer = async (viewerSocketId) => {
    const pc = createPeerConnection(viewerSocketId);
    peerConnections.current[viewerSocketId] = pc;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { streamId, offer, toSocketId: viewerSocketId });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  const endStream = async () => {
    try {
      await axios.post(`http://localhost:5000/api/streams/end/${streamId}`);
    } catch (err) {
      console.error('Error ending stream:', err);
    }
  };

  const toggleViewUsers = () => {
    if (!showViewers) {
      socket.emit('getViewers', { streamId }, ({ viewers }) => {
        setCurrentViewers(viewers);
        setShowViewers(true);
      });
    } else {
      setShowViewers(false);
    }
  };

  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      // Send the screen stream to viewers
      if (screenShareVideoRef.current) {
        screenShareVideoRef.current.srcObject = stream;
      }
      Object.keys(peerConnections.current).forEach(async (viewerSocketId) => {
        const pc = peerConnections.current[viewerSocketId];
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { streamId, offer, toSocketId: viewerSocketId });
      });
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  return (
    <div className="view-stream-container">
      <h2>Stream: {streamInfo?.streamerUsername}</h2>
      {user.role === 'streamer' && (
        <>
          <button className="end-stream-button" onClick={endStream}>
            End Stream
          </button>
          <button className="share-screen-button" onClick={shareScreen}>
            Share Screen
          </button>
        </>
      )}
      <>
        <video ref={localVideoRef} autoPlay playsInline muted className="local-stream-video" />
        <video ref={screenShareVideoRef} autoPlay playsInline className="screen-share-video" />
        </>
     
      {user.role === 'viewer' && (
        <>
        <video ref={remoteVideoRef} autoPlay playsInline controls className="stream-video" />
        <video ref={screenShareVideoRef} autoPlay playsInline className="screen-share-video" />
        </>
      )}
      <div className="viewers-info">
        <h3>Viewers: {viewers.length}</h3>
        <button className="view-users-button" onClick={toggleViewUsers}>
          View Users
        </button>
      </div>
      <ChatBox socket={socket} streamId={streamId} username={user.username} />
      {/* Modal to show viewers */}
      {showViewers && (
        <div className="viewers-modal">
          <h4>Current Viewers:</h4>
          {currentViewers.length === 0 ? (
            <p>No viewers currently.</p>
          ) : (
            <ul>
              {currentViewers.map((viewerId, index) => (
                <li key={index}>{viewerId}</li> // Replace with username if available
              ))}
            </ul>
          )}
        <button onClick={() => setShowViewers(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ViewStream;
