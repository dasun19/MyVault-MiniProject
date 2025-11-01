const mongoose = require('mongoose');

// Main default mongoose connection (used by the app)
let adminConnection = null;

// If an admin DB URI is provided, create a separate connection for admin models
if (process.env.DATABASE_ADMIN_URL) {
    try {
        // createConnection returns a Connection instance; ensure it's open by using asPromise()
        adminConnection = mongoose.createConnection(process.env.DATABASE_ADMIN_URL, {
            // recommended options can go here
            // useNewUrlParser/UnifiedTopology are defaults in recent mongoose
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