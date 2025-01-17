require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(express.json()); // Parses JSON bodies


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Home route ("/") - Sends index.html from 'public' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Sends the index.html file
});

// Review route ("/review") - Sends review.html from 'public' folder
app.get('/review', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'review.html'));  // Sends the review.html file
});

// Register route ("/register") - Serve the register.html page when accessed via GET
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));  // Sends the register.html file
});

// Register route ("/register") - Handle user registration via POST
app.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  console.log(req.body)
  try {
    const hashedPassword = password; // Replace with actual hashing logic
    const newUser = new User({ first_name, last_name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the password
    const isMatch = password== user.password;

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
