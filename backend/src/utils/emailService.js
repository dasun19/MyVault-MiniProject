const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email transporter error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: {
            name: 'MyVault',
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'MyVault Email Verification',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Please verify your email address</h1>
                <p>Thank you for registering with MyVault. Please click the button below to verify your email address:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #2563eb; 
                              color: white; 
                              padding: 12px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;
                              font-weight: bold;">
                        Verify Email
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
                <p style="color: #2563eb; word-break: break-all;">${verificationLink}</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                    This is an automated message from MyVault. Please do not reply to this email.
                </p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent successfully to:', email);
        console.log('📧 Message ID:', info.messageId);
        console.log('🔗 Verification link:', verificationLink);
        return info;
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw error;
    }
};

const sendPasswordResetOTP = async (email, verificationCode) => {
    const mailOptions = {
        from: {
            name: 'MyVault',
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'MyVault Password Reset Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Password Reset Request</h1>
                <p>You requested a password reset for your MyVault account. Use the verification code below to reset your password:</p>
                
                <div style="background-color: #f3f4f6; 
                            padding: 30px; 
                            border-radius: 10px; 
                            text-align: center; 
                            margin: 30px 0;">
                    <h2 style="font-size: 48px; 
                               letter-spacing: 10px; 
                               color: #2563eb; 
                               margin: 0;
                               font-weight: bold;">
                        ${verificationCode}
                    </h2>
                </div>
                
                <p style="color: #ef4444; font-weight: 600; font-size: 16px;">
                    ⏰ This code will expire in 10 minutes.
                </p>
                
                <p style="color: #6b7280;">
                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
                
                <div style="background-color: #fef3c7; 
                            border-left: 4px solid #f59e0b; 
                            padding: 15px; 
                            margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;">
                        <strong>Security Tip:</strong> Never share this code with anyone. MyVault will never ask you for this code.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                    This is an automated message from MyVault. Please do not reply to this email.
                </p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset code sent successfully to:', email);
        console.log('📧 Message ID:', info.messageId);
        console.log('🔐 Verification Code:', verificationCode);
        return info;
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetOTP
};