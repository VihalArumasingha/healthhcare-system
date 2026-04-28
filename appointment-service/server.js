const app = require("./app");
const connectDB = require("./config/db");

require("dotenv").config();

connectDB();

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Appointment Service running on ${PORT}`);
});