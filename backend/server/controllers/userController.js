// server/controllers/userController.js

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const usersDataPath = path.join(__dirname, '..', 'data', 'users.json');

// Helper function to read users
const readUsers = () => {
  const data = fs.readFileSync(usersDataPath, 'utf-8');
  return JSON.parse(data).users;
};

// Helper function to write users
const writeUsers = (users) => {
  fs.writeFileSync(usersDataPath, JSON.stringify({ users }, null, 2));
};

// Register User
exports.registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const users = readUsers();
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role, // 'viewer' or 'streamer'
      streams: [],
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = readUsers();
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // In a real application, generate a JWT token here
    res.status(200).json({ user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
