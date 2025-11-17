

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    idNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+94\d{9}$/, 'Invalid Phone Number, Enter with country code (+94)']

    },
    passwordHash: {
        type: String,
        required:true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'deleted'],
        default: 'pending'
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
     resetPasswordCode: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
}, 
{
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Hash Password before saving
userSchema.pre('save', async function(next){
    if (!this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
});

// Method to check Password
userSchema.methods.checkPassword = async function(password){
    return bcrypt.compare(password, this.passwordHash);
};


module.exports = mongoose.model('User', userSchema);