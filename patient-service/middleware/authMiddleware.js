const admin = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Attach the user's firebaseId and role to the request object
        req.user = {
            firebaseId: decodedToken.uid,
            role: decodedToken.role 
        };
        
        next(); 
    } catch (error) {
        console.error('Error verifying token:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const verifyAdminToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Check if the user has the 'admin' role in their custom claims
        if (decodedToken.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
        }

        req.user = {
            firebaseId: decodedToken.uid,
            role: decodedToken.role
        };
        
        next();
    } catch (error) {
        console.error('Error verifying admin token:', error.message);
        res.status(401).json({ message: 'Token is not valid or expired' });
    }
};

module.exports = { verifyToken, verifyAdminToken };
