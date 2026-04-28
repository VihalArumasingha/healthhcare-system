const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/payments", require("./routes/paymentRoutes"));

module.exports = app;