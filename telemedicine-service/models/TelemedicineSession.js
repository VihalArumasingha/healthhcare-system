const mongoose = require("mongoose");

const telemedicineSessionSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    index: true
  },
  doctorId: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ["agora", "jitsi"],
    default: "agora"
  },
  channelName: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"],
    default: "SCHEDULED"
  },
  startedAt: Date,
  endedAt: Date,
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model("TelemedicineSession", telemedicineSessionSchema);
