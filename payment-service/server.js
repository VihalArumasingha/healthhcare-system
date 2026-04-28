require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});