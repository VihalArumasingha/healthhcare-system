const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Assuming same DS database; each service has its own collections
    // You should use process.env.MONGO_URI, with a fallback if undefined during dev
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ds-project', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Patient Service MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Patient Service Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
