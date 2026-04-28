require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.TELEMEDICINE_SERVICE_PORT || 5006;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Telemedicine Service running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to start Telemedicine Service:", error.message);
});
