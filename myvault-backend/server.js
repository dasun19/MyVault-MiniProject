

// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/utils/database');

// Import routes
const authRoutes = require('./src/routes/authRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors()); // Allow requests from React Native app
app.use(express.json()); // Parse JSON bodies

//  Routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req,res) => {
    res.json({
        message: 'MyVault Backend is running!',
        version: '1.0.0',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login'
        }
        
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'});
});

// Add this before app.listen()
connectDB();

// Start server
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
});

