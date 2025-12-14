const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/authMiddleware');

// Admin Dashboard Routes
router.get('/dashboard', requireAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Admin dashboard data',
            data: {
                adminId: req.admin._id,
                username: req.admin.username,
                role: req.admin.role
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;