const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({

    firebaseId: {
  type: String,
  required: true,
  unique: true
},

    // Basic Info
    name: String,
    email: String,
    phone: String,

    // Professional Info
    specialty: String,
    qualifications: [String],
    experience: Number,
    licenseNumber: String,
    hospital: String,

    // Profile Details
    bio: String,
    profilePicture: String,
    consultationFee: Number,

    slotDuration: {
        type: Number,
        default: 30
    }, // default 30 mins

    // Availability
    availability: [
    {
        date: String,
        slots: [
            {
                time: String,
                isBooked: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    }
]

}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);