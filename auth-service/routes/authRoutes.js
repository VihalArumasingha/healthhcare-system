const express = require('express');
const router = express.Router();
const { registerUser, getUserProfile, updateUserProfile, deleteAccount } = require('../controllers/authController');
const { getPendingDoctors, verifyDoctor, rejectDoctor, getAllUsers, updateUserStatus } = require('../controllers/adminController');
const { verifyToken, verifyAdminToken } = require('../middleware/authMiddleware');
const User = require('../models/User');

// POST /api/auth/register
// User already registered via frontend, so we just save them in MongoDB + add claims
router.post('/register', verifyToken, registerUser);

// GET /api/auth/me
router.get('/me', verifyToken, getUserProfile);

// PUT /api/auth/profile
router.put('/profile', verifyToken, updateUserProfile);

// DELETE /api/auth/profile
router.delete('/profile', verifyToken, deleteAccount);

// Admin User Management
router.get('/admin/users', verifyAdminToken, getAllUsers);
router.patch('/admin/users/:firebaseId/status', verifyAdminToken, updateUserStatus);

// Admin Routes
router.get('/admin/doctors/pending', verifyAdminToken, getPendingDoctors);
router.get('/admin/doctors/all', verifyAdminToken, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' });
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});
router.patch('/admin/doctors/:firebaseId/verify', verifyAdminToken, verifyDoctor);
router.patch('/admin/doctors/:firebaseId/reject', verifyAdminToken, rejectDoctor);
router.patch('/admin/doctors/:firebaseId/update', verifyAdminToken, async (req, res) => {
    try {
        const { name, phoneNumber, address, status } = req.body;
        const user = await User.findOneAndUpdate(
            { firebaseId: req.params.firebaseId, role: 'doctor' },
            { name, phoneNumber, address, status },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'Not found' });
        
        // Sync custom claims if status changed
        const admin = require('../config/firebase');
        await admin.auth().setCustomUserClaims(req.params.firebaseId, { role: 'doctor', status });
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/auth/verify-status
// Check if current user (doctor) has been verified
router.get('/verify-status', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseId: req.user.uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            status: user.status,
            role: user.role,
            isApproved: user.status === 'approved'
        });
    } catch (err) {
        res.status(500).json({ message: 'Error checking status', error: err.message });
    }
});

// Stats/Count Routes
router.get('/users/count', verifyToken, async (req, res) => {
    try {
        const { role, status, activeStatus } = req.query;
        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (activeStatus) query.activeStatus = activeStatus;
        const count = await require('../models/User').countDocuments(query);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Error counting users' });
    }
});

module.exports = router;
