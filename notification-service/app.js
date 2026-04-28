const express = require("express");
const app = express();

app.use(express.json());

const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/notifications", notificationRoutes);

module.exports = app;