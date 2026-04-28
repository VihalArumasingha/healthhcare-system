require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
    console.log(`Doctor Service running on port ${PORT}`);
});