const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Access denied. Admin not found.' });
        }

        // Compare token version to server-side stored tokenVersion to support server-side logout
        // If token doesn't carry a version or versions mismatch, treat as invalid
        if (typeof decoded.v === 'undefined' || decoded.v !== admin.tokenVersion) {
            return res.status(401).json({ message: 'Token has been invalidated' });
        }

        // Attach admin to request
        req.admin = admin;
        req.token = token;

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware that requires the user to be an admin
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden. Admins only.' });
        }

        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ message: 'Access denied. Admin not found.' });

        req.admin = admin;
        req.token = token;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// Attach requireAdmin to the default export function so existing requires still work
authMiddleware.requireAdmin = requireAdmin;
module.exports = authMiddleware;

// Also export named property for destructuring (e.g. const { requireAdmin } = require(...))
module.exports.requireAdmin = requireAdmin;