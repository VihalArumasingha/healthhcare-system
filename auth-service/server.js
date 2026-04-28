const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Auth Service is running on port ${PORT}`);
});
