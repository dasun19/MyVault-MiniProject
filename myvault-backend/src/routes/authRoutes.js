const express = require('express');
const { body } = require('express-validator');
const { 
    register, 
    login, 
    verifyEmail, 
    validateToken,
    updateAccount,
    deleteAccount,
    forgotPassword,
    resetPassword
 } = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const auth = require('../middleware/auth');  

const router = express.Router();

// Registration route with validation
router.post('/register', [
    body('fullName')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Full name must be at least 2 characters'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('phoneNumber')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    body('password')
        .isLength({ min: 8, max: 20 })
        .withMessage('Password must be at least 8 characters long.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
], validateRequest, register);

// Login route with validation
router.post('/login', [
    body('idNumber')
        .trim()
        .notEmpty()
        .withMessage('ID number is required')
        .matches(/^\d{9}[vVxX]$|^\d{12}$/)
        .withMessage('Enter a valid Sri Lankan ID number'),

    body('password')
        .isLength({ min: 8, max: 20 })
        .withMessage('Please enter the correct password.')
], validateRequest, login);

router.get('/verify-email', verifyEmail);

router.get('/validate-token', auth, validateToken);

// Update account
router.put('/update', auth, updateAccount);

// Delete account
router.delete('/delete', auth, deleteAccount);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password/:token', resetPassword);

module.exports = router;