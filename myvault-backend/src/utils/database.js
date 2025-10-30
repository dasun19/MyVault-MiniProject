const mongoose = require('mongoose');

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