const express = require('express');
const cors = require('cors');
const patientRoutes = require('./routes/patientRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/patients', patientRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'patient-service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
