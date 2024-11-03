// server/routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register User
router.post('/register', userController.registerUser);

// Login User
router.post('/login', userController.loginUser);

module.exports = router;
