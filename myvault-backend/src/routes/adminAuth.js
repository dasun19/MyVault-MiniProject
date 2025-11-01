// src/routes/adminAuth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

router.post("/login", async (req, res) => {
  // Login with username + password only
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
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
      admin: { id: admin._id, username: admin.username },
      message: "Login successful"
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
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
    await Admin.findByIdAndUpdate(decoded.id, { $inc: { tokenVersion: 1 } });

    res.json({ message: 'Logged out (token invalidated)' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;