const User = require('../models/User');
const admin = require('../config/firebase');

// @route   GET /api/auth/admin/doctors/pending
// @desc    Get all pending doctors
// @access  Private (Admin only)
const getPendingDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor', status: 'pending' });
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error fetching pending doctors:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   PATCH /api/auth/admin/doctors/:firebaseId/verify
// @desc    Verify a doctor
// @access  Private (Admin only)
const verifyDoctor = async (req, res) => {
    try {
        const { firebaseId } = req.params;

        const user = await User.findOneAndUpdate(
            { firebaseId, role: 'doctor' },
            { status: 'approved' },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Set the isVerified claim so frontend recognizes the doctor as verified
        await admin.auth().setCustomUserClaims(firebaseId, { role: 'doctor', isVerified: true });

        res.status(200).json({ message: 'Doctor verified successfully', user });
    } catch (error) {
        console.error("Error verifying doctor:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   PATCH /api/auth/admin/doctors/:firebaseId/reject
// @desc    Reject a doctor
// @access  Private (Admin only)
const rejectDoctor = async (req, res) => {
    try {
        const { firebaseId } = req.params;

        const user = await User.findOneAndUpdate(
            { firebaseId, role: 'doctor' },
            { status: 'rejected' },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Update firebase claim to block
        await admin.auth().setCustomUserClaims(firebaseId, { role: 'doctor', status: 'rejected' });

        res.status(200).json({ message: 'Doctor rejected', user });
    } catch (error) {
        console.error("Error rejecting doctor:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   GET /api/auth/admin/users
// @desc    Get all users (with optional role filter)
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const users = await User.find(query);
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @route   PATCH /api/auth/admin/users/:firebaseId/status
// @desc    Update user activeStatus (Active, Suspended, Deleted)
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
    try {
        const { firebaseId } = req.params;
        const { activeStatus } = req.body;

        if (!['Active', 'Suspended', 'Deleted'].includes(activeStatus)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findOneAndUpdate(
            { firebaseId },
            { activeStatus },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: If 'Deleted' or 'Suspended', you might want to disable them in Firebase Auth as well
        if (activeStatus === 'Deleted' || activeStatus === 'Suspended') {
            await admin.auth().updateUser(firebaseId, { disabled: true });
        } else {
            await admin.auth().updateUser(firebaseId, { disabled: false });
        }

        res.status(200).json({ message: `User status updated to ${activeStatus}`, user });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getPendingDoctors,
    verifyDoctor,
    rejectDoctor,
    getAllUsers,
    updateUserStatus
};