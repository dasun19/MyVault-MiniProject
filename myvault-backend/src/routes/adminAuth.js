// src/routes/adminAuth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/Admin");
const AuthorityModel = require("../models/Authority");
const { requireAdmin } = require("../middleware/authMiddleware");


router.post("/login", async (req, res) => {
  // Login with username + password only
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const admin = await AdminModel.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Include tokenVersion in the token payload so it can be invalidated server-side
    const token = jwt.sign(
      { id: admin._id, role: "admin", v: admin.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "0.25h" }
    );

    res.json({
      token,
      user: { id: admin._id, username: admin.username },
      message: "Login successful"
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout route — invalidates current token by incrementing tokenVersion
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // increment tokenVersion to invalidate all previously issued tokens
    await admin.findByIdAndUpdate(decoded.id, { $inc: { tokenVersion: 1 } });

    res.json({ message: 'Logged out (token invalidated)' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create authority
// Helper to validate username/password 

const validateBody = (username, password) => {
  if (!username || typeof username !== "string" || username.trim().length <3){
    return "Username must be at least 3 characters";
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
};

// POST /create-authority
router.post("/create-authority", requireAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    const validateError = validateBody(username, password);
    if (validateError) return res.status(400).json({ message: validateError });

    // Normalize
    const normalizedUsername = username.trim().toLowerCase();

    // Check uniqueness
    const exists = await AuthorityModel.findOne({ username: normalizedUsername });
    if (exists) return res.status(409).json({ message: "Username already exists"});

    // Create authority user
    // Password hashing should be handled by authority model pre-save hook

    const authority = new AuthorityModel({
      username: normalizedUsername,
      password,             // will be hashed by model  
    });

    await authority.save();

    // Return safe user object

    res.status(201).json({
      message: "Authority account created",
      user: {
        id: authority._id,
        username: authority.username,
        role: authority.role,
        createdAt: authority.createdAt
      }
    });
  } catch (err){
    console.error("create authority error:", err);

    // handle duplicate key race condition
    if (err.code === 11000){
      return res.status(409).json({ message: "Username already exists"});
    }

    res.status(500).json({ message: "Server error "});
  }
});

module.exports = router;