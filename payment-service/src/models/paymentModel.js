const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    appointmentId: String,
    patientId: String,
    amount: Number,
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING"
    },
    transactionId: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);