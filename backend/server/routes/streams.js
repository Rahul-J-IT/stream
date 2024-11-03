// server/routes/streams.js

const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');

// Create Stream
router.post('/', streamController.createStream);

// Get All Streams
router.get('/', streamController.getAllStreams);

// Get Stream by ID
router.get('/:id', streamController.getStreamById);

router.post('/end/:id', streamController.endStream);

module.exports = router;
