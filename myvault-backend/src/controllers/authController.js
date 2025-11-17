
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetOTP } = require('../utils/emailService'); 
const bcrypt = require('bcryptjs');

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

// Update user account
const updateAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, email, phoneNumber } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, email, phoneNumber },
            { new: true}
        );

        if (!updatedUser) {
            return res.status(404).json({success: false, message: "User not found"});

        }

        res.json({
            success: true,
            message: 'Account updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({success: false, message: 'Server error during account update'});
    }
};

// Delete user account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;

        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({success: false, message: 'Server error during account deletion'});

    }
};

// Forgot Password - generates verification code
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists (security best practice)
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a verification code has been sent"
            });
        }

        // Generate 5-digit verification code
        const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
        
        // Save code and expiry (10 minutes to match email message)
        user.resetPasswordCode = verificationCode;
        user.resetPasswordExpires = Date.now() + 600000; // 10 minutes (not 1 hour)
        await user.save();

        // Send code via email
        await sendPasswordResetOTP(user.email, verificationCode);

        res.status(200).json({
            success: true,
            message: "Verification code sent to your email. It will expire in 10 minutes."
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending verification code. Please try again.'
        });
    }
};

// Reset password with verification code
const resetPassword = async (req, res) => {
    try {
        const { email, verificationCode, newPassword } = req.body;

        if (!email || !verificationCode || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, verification code, and new password are required.'
            });
        }

        // Find user with valid verification code
        const user = await User.findOne({
            email,
            resetPasswordCode: verificationCode,
            resetPasswordExpires: { $gt: Date.now() } // Check not expired
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code.'
            });
        }

        // Update password (will be auto-hashed by pre-save hook)
        user.passwordHash = newPassword;
        
        // Clear reset code fields
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password. Please try again.'
        });
    }
};


module.exports = {
    register,
    login,
    verifyEmail,
    validateToken,
    updateAccount,
    deleteAccount,
    forgotPassword,
    resetPassword,
    
};