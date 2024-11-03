// server/index.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

dotenv.config();

const userRoutes = require('./routes/users');
const streamRoutes = require('./routes/streams');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Replace '*' with your frontend URL in production for security
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/streams', streamRoutes);

// Export io for use in controllers
module.exports = { app, server, io };

// Path to data files
const streamsDataPath = path.join(__dirname, 'data', 'streams.json');
const usersDataPath = path.join(__dirname, 'data', 'users.json');
const chatsDataPath = path.join(__dirname, 'data', 'chats.json');

// Ensure data directories and files exist
const ensureDataFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

ensureDataFile(streamsDataPath, { streams: [] });
ensureDataFile(usersDataPath, { users: [] });
ensureDataFile(chatsDataPath, { chats: [] });

// Track viewers per stream
const streamsViewers = {}; // { streamId: { viewerId: { socketId, username } } }

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle joining a stream
  socket.on('joinStream', ({ streamId, userId, username }) => {
    socket.join(streamId);
    console.log(`User ${username} (${userId}) joined stream ${streamId}`);

    // Initialize viewers mapping if not present
    if (!streamsViewers[streamId]) {
      streamsViewers[streamId] = {};
    }

    // Add viewer to the mapping
    streamsViewers[streamId][userId] = { socketId: socket.id, username };

    // Notify streamer about new viewer
    io.to(streamId).emit('updateViewers', {
      viewerId: userId,
      viewerSocketId: socket.id,
      username,
    });
  });

  // Handle chat messages
  socket.on('chatMessage', ({ streamId, message, username }) => {
    // Save chat to chats.json
    const chatData = JSON.parse(fs.readFileSync(chatsDataPath, 'utf-8'));
    const newChat = {
      streamId,
      username,
      message,
      timestamp: new Date(),
    };
    chatData.chats.push(newChat);
    fs.writeFileSync(chatsDataPath, JSON.stringify(chatData, null, 2));

    io.to(streamId).emit('newChatMessage', newChat);
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', ({ streamId, offer, toSocketId }) => {
    console.log(`Received offer from ${socket.id} to ${toSocketId}`);
    io.to(toSocketId).emit('webrtc-offer', { offer, fromSocketId: socket.id });
  });

  socket.on('webrtc-answer', ({ answer, toSocketId }) => {
    console.log(`Received answer from ${socket.id} to ${toSocketId}`);
    io.to(toSocketId).emit('webrtc-answer', { answer, fromSocketId: socket.id });
  });

  socket.on('webrtc-ice-candidate', ({ candidate, toSocketId }) => {
    console.log(`Received ICE candidate from ${socket.id} to ${toSocketId}`);
    io.to(toSocketId).emit('webrtc-ice-candidate', { candidate, fromSocketId: socket.id });
  });

  // Handle getting the list of current viewers
  socket.on('getViewers', ({ streamId }, callback) => {
    if (streamsViewers[streamId]) {
      const viewerList = Object.values(streamsViewers[streamId]).map((viewer) => viewer.username);
      callback({ viewers: viewerList });
    } else {
      callback({ viewers: [] });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Iterate through all streams to find if this socket was a viewer
    for (const streamId in streamsViewers) {
      for (const viewerId in streamsViewers[streamId]) {
        if (streamsViewers[streamId][viewerId].socketId === socket.id) {
          const username = streamsViewers[streamId][viewerId].username;
          // Remove viewer from the mapping
          delete streamsViewers[streamId][viewerId];

          // Notify others in the stream that a viewer has left
          io.to(streamId).emit('viewerLeft', { viewerId, socketId: socket.id, username });
          break;
        }
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(5000, () => {
  console.log(`Server is running on port ${PORT}`);
});
