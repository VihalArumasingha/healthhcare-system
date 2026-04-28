const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
}, { _id: false });

const medicalHistorySchema = new mongoose.Schema({
    condition: { type: String },
    diagnosedDate: { type: Date },
    notes: { type: String }
}, { _id: false });

const medicalReportSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // The Cloudinary link
    uploadedAt: { type: Date, default: Date.now }
}); // Removed { _id: false } so we can delete by ID

const patientSchema = new mongoose.Schema({
    // Primary link to the auth-service Identity (from Firebase)
    firebaseId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    // Patient specific domain data
    profileImage: { // The Cloudinary link for the profile picture
        type: String,
        default: ''
    },
    dateOfBirth: { 
        type: Date 
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other', 'Prefer Not To Say'],
        default: 'Prefer Not To Say'
    },
    bloodGroup: { 
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        default: 'Unknown'
    },
    allergies: [{ 
        type: String 
    }],
    medicalHistory: [medicalHistorySchema],
    medicalReports: [medicalReportSchema], // Array of uploaded reports
    emergencyContact: emergencyContactSchema
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
