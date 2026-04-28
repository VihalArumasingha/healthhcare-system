// patient-service/server.js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// In a real project you might use dotenv to load this
const PORT = process.env.PORT || 5002;

// Connect to MongoDB
connectDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Patient Service is running on http://localhost:${PORT}`);
    });

    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Retrying on port ${parseInt(PORT) + 1}...`);
            setTimeout(() => {
                server.close();
                server.listen(parseInt(PORT) + 1);
            }, 1000);
        }
    });
}).catch(err => {
    console.error("Failed to start Patient Service:", err.message);
});
