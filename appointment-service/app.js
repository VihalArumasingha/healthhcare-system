const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/uploads", express.static("uploads"));

module.exports = app;