
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, token) => {
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    const msg = {
        to : email,
        from : process.env.SENDGRID_FROM_EMAIL,
        subject: 'MyVault Email Verification',
        html: `
            <h1>Please verify your email address</h1>
            <p>Thank you for registering. Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">Verify Email</a>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log('Verification email sent successfully.');
        console.log(`http://localhost:3000/api/auth/verify-email?token=${token}`);
    } catch (error){
        console.error('Error sending verification email:', error);
    }
};

module.exports = {
    sendVerificationEmail
};