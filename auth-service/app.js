const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Auth Service is running...');
});

// Import and use routes (to be created next)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

module.exports = app;
