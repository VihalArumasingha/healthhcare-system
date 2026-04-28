const express = require('express');
const router = express.Router();
const { getPatientProfile, createPatientProfile, updatePatientProfile, uploadPatientImage, uploadPatientReport, deletePatientReport } = require('../controllers/patientController');
const { getAllPatientProfiles, getPatientProfileById, deletePatientProfile, updatePatientProfileByAdmin } = require('../controllers/adminController');
const { verifyToken, verifyAdminToken } = require('../middleware/authMiddleware');
const { uploadProfileImage, uploadReportFile } = require('../config/cloudinary');

// Define Routes for regular patients
router.get('/profile', verifyToken, getPatientProfile);
router.post('/profile/create', verifyToken, createPatientProfile);
router.put('/profile', verifyToken, updatePatientProfile);

// Routes for Uploading Files (Images and Reports)
// Multer middleware sits between verification and your logic
router.post('/profile/image', verifyToken, uploadProfileImage.single('image'), uploadPatientImage);
router.post('/profile/reports', verifyToken, uploadReportFile.single('report'), uploadPatientReport);
router.delete('/profile/reports/:reportId', verifyToken, deletePatientReport);

// Define Routes for Admins
router.get('/admin/all', verifyAdminToken, getAllPatientProfiles);
router.get('/admin/:firebaseId', verifyAdminToken, getPatientProfileById);
router.delete('/admin/:firebaseId', verifyAdminToken, deletePatientProfile);
router.put('/admin/:firebaseId', verifyAdminToken, updatePatientProfileByAdmin);

module.exports = router;