const mongoose = require('mongoose');

// Main default mongoose connection (used by the app)
let adminConnection = null;
let authorityConnection = null;

// If an admin DB URI is provided, create a separate connection for admin models
if (process.env.DATABASE_ADMIN_URL) {
    try {
        adminConnection = mongoose.createConnection(process.env.DATABASE_ADMIN_URL, {    
        });

        // Log when admin connection opens
        adminConnection.on('connected', () => {
            console.log('Admin MongoDB connected to', process.env.DATABASE_ADMIN_URL);
        });
        adminConnection.on('error', (err) => {
            console.error('Admin MongoDB connection error:', err);
        });
    } catch (err) {
        console.error('Failed to create admin DB connection:', err);
        adminConnection = null;
    }
}

if (process.env.DATABASE_AUTHORITY_URL) {
    try {
        authorityConnection = mongoose.createConnection(process.env.DATABASE_AUTHORITY_URL, {    
        });

        // Log when authority connection opens
        authorityConnection.on('connected', () => {
            console.log('Authority MongoDB connected to', process.env.DATABASE_AUTHORITY_URL);
        });
        authorityConnection.on('error', (err) => {
            console.error('Authority MongoDB connection error:', err);
        });
    } catch (err) {
        console.error('Failed to create authority DB connection:', err);
        authorityConnection = null;
    }
}

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB connected: ${connection.connection.host}`);

    } catch (error) {
        console.error('MongoDB connection error.',error);
        process.exit(1);
    }
};

module.exports = connectDB;
module.exports.adminConnection = () => adminConnection;
module.exports.authorityConnection = () => authorityConnection;