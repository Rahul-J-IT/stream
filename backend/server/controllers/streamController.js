// server/controllers/streamController.js

const fs = require('fs');
const path = require('path');

const streamsDataPath = path.join(__dirname, '..', 'data', 'streams.json');
const usersDataPath = path.join(__dirname, '..', 'data', 'users.json');

// Helper function to read streams
const readStreams = () => {
  const data = fs.readFileSync(streamsDataPath, 'utf-8');
  return JSON.parse(data).streams;
};

// Helper function to write streams
const writeStreams = (streams) => {
  fs.writeFileSync(streamsDataPath, JSON.stringify({ streams }, null, 2));
};

// Helper function to read users
const readUsers = () => {
  const data = fs.readFileSync(usersDataPath, 'utf-8');
  return JSON.parse(data).users;
};

// Helper function to write users
const writeUsers = (users) => {
  fs.writeFileSync(usersDataPath, JSON.stringify({ users }, null, 2));
};

// Create Stream
exports.createStream = (req, res) => {
  const { title, streamerId } = req.body;
  try {
    const streams = readStreams();
    const users = readUsers();

    const streamer = users.find((user) => user.id === streamerId && user.role === 'streamer');
    if (!streamer) {
      return res.status(400).json({ error: 'Invalid streamer' });
    }

    const newStream = {
      id: Date.now().toString(),
      title,
      streamerId,
      viewers: [],
      createdAt: new Date(),
    };

    streams.push(newStream);
    writeStreams(streams);

    // Update streamer's streams
    streamer.streams.push(newStream.id);
    writeUsers(users);

    res.status(201).json({ stream: newStream });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Streams
exports.getAllStreams = (req, res) => {
  try {
    const streams = readStreams();
    const users = readUsers();

    // Populate streamer username
    const populatedStreams = streams.map((stream) => {
      const streamer = users.find((user) => user.id === stream.streamerId);
      return {
        ...stream,
        streamerUsername: streamer ? streamer.username : 'Unknown',
      };
    });

    res.status(200).json({ streams: populatedStreams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Stream by ID
exports.getStreamById = (req, res) => {
  const streamId = req.params.id;
  try {
    const streams = readStreams();
    const users = readUsers();

    const stream = streams.find((s) => s.id === streamId);
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const streamer = users.find((user) => user.id === stream.streamerId);

    res.status(200).json({
      stream: {
        ...stream,
        streamerUsername: streamer ? streamer.username : 'Unknown',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.endStream = (req, res) => {
    const streamId = req.params.id;
    try {
      const streamsData = JSON.parse(fs.readFileSync(streamsDataPath, 'utf-8'));
      const streamIndex = streamsData.streams.findIndex((s) => s.id === streamId);
      if (streamIndex === -1) {
        return res.status(404).json({ error: 'Stream not found' });
      }
  
      // Update stream status to 'ended'
      streamsData.streams[streamIndex].status = 'ended';
      fs.writeFileSync(streamsDataPath, JSON.stringify(streamsData, null, 2));
  
      // Optionally, remove the stream from streamer's list
      const usersData = JSON.parse(fs.readFileSync(usersDataPath, 'utf-8'));
      const streamer = usersData.users.find((u) => u.id === streamsData.streams[streamIndex].streamerId);
      if (streamer) {
        streamer.streams = streamer.streams.filter((sId) => sId !== streamId);
        fs.writeFileSync(usersDataPath, JSON.stringify(usersData, null, 2));
      }
  
      // Notify all viewers via Socket.io (Assuming you have access to `io`)
      const io = require('../index').io; // Export io from your main server file
      io.to(streamId).emit('streamEnded', { message: 'The stream has ended.' });
  
      res.status(200).json({ message: 'Stream ended successfully.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
