
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');

//Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Register new user
const register = async (req, res) => {
    try {
        const { fullName, idNumber, email, phoneNumber, password } = req.body;


        // ID number format check
        const idRegex = /^\d{9}[vVxX]$|^\d{12}$/;

        if (!idRegex.test(idNumber)) {
            return res.status(400).json({
            success: false,
            message: 'Invalid ID number format. Use 9 digits + V/X or 12 digits.'
             });
            }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Phone number format check (+94XXXXXXXXX)
        const phoneRegex = /^\+94\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number. Enter in format +94XXXXXXXXX'
            });
        }

        // Check is user already exists
        const existingUser = await User.findOne({idNumber});

        if (existingUser){
            return res.status(409).json({
                success:false,
                message: 'User already exists with this id number'
            });

        }

        // Generate a verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationTokenExpires = Date.now() + 3600000; // 1 hour

        // Create new user
        const user = new User({
            fullName,
            idNumber,
            email,
            phoneNumber,
            passwordHash: password, // Will be hashed automatically by the model
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: verificationTokenExpires
        });

        // Save user & handle validation errors
        try {
            await user.save();
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({
                    success: false,
                    message: messages[0] // first validation error
                });
            }
            throw error; // let outer catch handle
        }

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        //  Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Úser registered successfully. Plese check your email to verify your account.',
            userId: user._id,
            token,
            user: {
                fullName: user.fullName,
                email: user.email,
                accountStatus: user.accountStatus
            }
        });

        

    } catch (error) {
        console.error('Registration error.', error);
        res.status(500).json({
            success:false,
            message: 'Server error during registration'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { idNumber, password } = req.body;

        // Find user by id number
        const user = await User.findOne({ idNumber });
        if (!user) {
            return res.status(401).json({
                success:false,
                message: 'Invalid ID number'
            });
        }

        // Check Password
        const isPasswordValid = await user.checkPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid ID number or Password'
            });        
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login Successful',
            token,
            user: {
                userId: user._id,
                fullName: user.fullName,
                idNumber: user.idNumber,
                email: user.email,
                phoneNumber: user.phoneNumber,
                accountStatus: user.accountStatus
            }
        });
    } catch ( error ) {
        console.error('Login error.', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// New verifyEmail function
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: Date.now() } //$gt: grater than

        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!'
        });
    } catch ( error ){
        console.error('Email verification error:',error);
        res.status(500).json({
            success:false,
            message: 'Server error during email verification.'
        });
    }
}

const validateToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (middleware has verified it)
    // req.user contains the decoded token data
    
    const user = req.user; // This comes from the auth middleware
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user.id || user.userId,
        email: user.email,
        // Add other user fields as needed
      }
    });
    
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token validation'
    });
  }
};

module.exports = {
    register,
    login,
    verifyEmail,
    validateToken
};