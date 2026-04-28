const Patient = require('../models/Patient');

// @route   GET /api/patients/profile
// @desc    Get the currently logged-in patient's medical profile
// @access  Private (Patient only)
const getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ firebaseId: req.user.firebaseId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Medical profile not found for this user.' });
        }
        
        res.status(200).json(patient);
    } catch (error) {
        console.error('Error fetching patient profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   POST /api/patients/profile/create
// @desc    Create a new patient medical profile
// @access  Private (Patient only)
const createPatientProfile = async (req, res) => {
    try {
        const { dateOfBirth, gender, bloodGroup, allergies, medicalHistory, emergencyContact } = req.body;

        const existingProfile = await Patient.findOne({ firebaseId: req.user.firebaseId });
        if (existingProfile) {
            return res.status(400).json({ message: 'Profile already exists for this user.' });
        }

        const patient = new Patient({
            firebaseId: req.user.firebaseId,
            dateOfBirth,
            gender,
            bloodGroup,
            allergies,
            medicalHistory,
            emergencyContact
        });

        await patient.save();
        res.status(201).json(patient);
    } catch (error) {
        console.error('Error creating patient profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   PUT /api/patients/profile
// @desc    Update patient medical profile
// @access  Private (Patient only)
const updatePatientProfile = async (req, res) => {
    try {
        const { dateOfBirth, gender, bloodGroup, allergies, medicalHistory, emergencyContact } = req.body;
        
        const patient = await Patient.findOne({ firebaseId: req.user.firebaseId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found. Please create one first.' });
        }

        patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
        patient.gender = gender || patient.gender;
        patient.bloodGroup = bloodGroup || patient.bloodGroup;
        if (allergies) patient.allergies = allergies;
        if (medicalHistory) patient.medicalHistory = medicalHistory;
        if (emergencyContact) patient.emergencyContact = emergencyContact;
        // Note: profileImage and medicalReports are updated via separate dedicated endpoints
        
        await patient.save();
        res.status(200).json(patient);
    } catch (error) {
        console.error('Error updating patient profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   POST /api/patients/profile/image
// @desc    Upload or update patient profile image
// @access  Private (Patient only)
const uploadPatientImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        
        let patient = await Patient.findOne({ firebaseId: req.user.firebaseId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found. Please create one first.' });
        }

        patient.profileImage = req.file.path; // The Cloudinary URL
        await patient.save();

        res.status(200).json({ message: 'Profile image updated', imageUrl: req.file.path });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   POST /api/patients/profile/reports
// @desc    Upload a new medical report
// @access  Private (Patient only)
const uploadPatientReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No report file uploaded' });
        }
        
        let patient = await Patient.findOne({ firebaseId: req.user.firebaseId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found. Please create one first.' });
        }

        const newReport = {
            fileName: req.file.originalname, // Original name from user's computer
            fileUrl: req.file.path // The Cloudinary URL
        };

        patient.medicalReports.push(newReport);
        await patient.save();

        res.status(200).json({ message: 'Medical report uploaded', medicalReports: patient.medicalReports });
    } catch (error) {
        console.error('Error uploading medical report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   DELETE /api/patients/profile/reports/:reportId
// @desc    Delete a medical report
// @access  Private (Patient only)
const deletePatientReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        
        let patient = await Patient.findOne({ firebaseId: req.user.firebaseId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }

        // Support both _id based deletion or fallback to fileUrl URL encoding
        patient.medicalReports = patient.medicalReports.filter(report => {
            if (report._id && report._id.toString() === reportId) return false;
            // Fallback if no _id exists on legacy records (encode comparison)
            if (encodeURIComponent(report.fileUrl) === reportId) return false;
            return true;
        });
        
        await patient.save();

        res.status(200).json({ message: 'Medical report deleted', medicalReports: patient.medicalReports });
    } catch (error) {
        console.error('Error deleting medical report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { 
    getPatientProfile, 
    createPatientProfile,
    updatePatientProfile,
    uploadPatientImage,
    uploadPatientReport,
    deletePatientReport
};