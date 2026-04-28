const Patient = require('../models/Patient');
const mongoose = require('mongoose');

// Define a connection to the Auth Database to fetch User identities
const authDbConnection = mongoose.createConnection(process.env.AUTH_MONGO_URI || 'mongodb+srv://DSProjectUser:74vsL5aj3DjF-jK@dscluster0.tiv8ucx.mongodb.net/auth_db?retryWrites=true&w=majority&appName=DsCluster0');

// Define the User model on the Auth DB connection
const User = authDbConnection.model('User', new mongoose.Schema({
    firebaseId: String,
    email: String,
    name: String,
    role: String,
    phoneNumber: String,
    address: String,
    activeStatus: String
}));

// @route   GET /api/patients/admin/all
// @desc    Get all patients' medical profiles (Admin only)
// @access  Private (Admin only)
const getAllPatientProfiles = async (req, res) => {
    try {
        console.log("Admin requesting all patient profiles...");
        // 1. Get all users who have the role 'patient'
        const users = await User.find({ role: 'patient' });
        console.log(`Found ${users.length} patient users from Auth DB`);
        
        // 2. Map through users and find their corresponding medical profile if it exists
        const patientsWithUserInfo = await Promise.all(users.map(async (user) => {
            const medicalProfile = await Patient.findOne({ firebaseId: user.firebaseId });
            console.log(`User ${user.email} medical profile: ${medicalProfile ? 'Found' : 'Missing'}`);
            
            return {
                ...(medicalProfile ? medicalProfile.toObject() : {}),
                firebaseId: user.firebaseId,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber || 'No phone',
                address: user.address || 'No address',
                activeStatus: user.activeStatus || 'Active' // Now uses User model status
            };
        }));

        console.log(`Returning ${patientsWithUserInfo.length} profiles to Admin`);
        res.status(200).json(patientsWithUserInfo);
    } catch (error) {
        console.error("Error fetching all patient profiles:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   GET /api/patients/admin/:firebaseId
// @desc    Get a specific patient's medical profile by their firebaseId (Admin only)
// @access  Private (Admin only)
const getPatientProfileById = async (req, res) => {
    try {
        const patient = await Patient.findOne({ firebaseId: req.params.firebaseId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }
        
        res.status(200).json(patient);
    } catch (error) {
        console.error("Error fetching patient profile by ID:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   DELETE /api/patients/admin/:firebaseId
// @desc    Delete a patient's medical profile (Admin only)
// @access  Private (Admin only)
const deletePatientProfile = async (req, res) => {
    try {
        const { firebaseId } = req.params;
        
        // Delete medical profile from patient-service
        await Patient.findOneAndDelete({ firebaseId });
        
        // Optional: If you wanted to delete from Auth DB as well, you would use:
        // await User.findOneAndDelete({ firebaseId });
        
        res.status(200).json({ message: 'Patient medical profile deleted successfully.' });
    } catch (error) {
        console.error("Error deleting patient profile:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   PUT /api/patients/admin/:firebaseId
// @desc    Update a patient's medical profile AND auth profile (Admin only)
// @access  Private (Admin only)
const updatePatientProfileByAdmin = async (req, res) => {
    try {
        const { firebaseId } = req.params;
        const { name, phone, address } = req.body; // activeStatus removed here, handled by Auth-Service directly

        // 1. Update User info in Auth DB
        await User.findOneAndUpdate(
            { firebaseId },
            { name, phoneNumber: phone, address },
            { new: true }
        );

        // Note: activeStatus is now updated via Auth-Service in frontend
        // If we want to keep it in sync here, we could add { activeStatus } but better to let Auth be the source of truth

        res.status(200).json({ 
            message: 'User profile updated successfully.'
        });
    } catch (error) {
        console.error("Error updating patient profile by admin:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getAllPatientProfiles,
    getPatientProfileById,
    deletePatientProfile,
    updatePatientProfileByAdmin
};
