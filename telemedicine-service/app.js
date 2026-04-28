const express = require("express");
const cors = require("cors");

const telemedicineRoutes = require("./routes/telemedicineRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "telemedicine-service" });
});

app.use("/api/telemedicine", telemedicineRoutes);

module.exports = app;
