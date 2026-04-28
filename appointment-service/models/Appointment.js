const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

  name: String,
  age: Number,
  email: String,
  phone: String,
  symptoms: String,
  report: String,
  prescription: String,
  doctorId: String,
  patientId: String,

  date: String,
  time: String,

  status: {
    type: String,
    enum: ["PENDING_PAYMENT", "CONFIRMED", "REJECTED"],
    default: "PENDING_PAYMENT"
  }

}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);