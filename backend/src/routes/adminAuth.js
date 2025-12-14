// src/routes/adminAuth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("..//models/User");
const AdminModel = require("../models/Admin");
const AuthorityModel = require("../models/Authority");
const { requireAdmin } = require("../middleware/authMiddleware");


router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({message: "Username and password required"});

    try {
        const admin = await AdminModel.findOne({ username });

        console.log("Admin login attempt:", { username, found: !!admin, role: admin?.role });

        if (!admin) return res.status(400).json({ message: "Invalid credentials"});

        // Security check: Verify this is actually an admin account
        if (admin.role && admin.role !== "admin") {
            console.log("Role mismatch: found role is", admin.role);
            return res.status(403).json({ message: "This account is registered as authority. Please use authority login." });
        }

        console.log("Password hash from DB:", admin.password?.substring(0, 20) + "...");
        console.log("Comparing password:", password);
        
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("Password match result:", isMatch);
        
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            {id: admin._id, role: "admin", v: admin.tokenVersion },
            process.env.JWT_SECRET,
            {expiresIn:"15m"}
        );

        res.json({token, user: {id: admin._id, username: admin.username, role: "admin"}, message: "Login successful"});

    } catch (err) {
        console.error("Admin login error:", err);
        res.status(500).json({ message: "Server error: " + err.message});
    }
});

// Logout route — invalidates current token by incrementing tokenVersion
router.post("/logout", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(401).json({ message: "Invalid token" }); }

    const admin = await AdminModel.findById(decoded.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.updateOne({ $inc: { tokenVersion: 1 } });
    res.json({ message: "Logged out (token invalidated)" });
  } catch (err) {
    console.error("Admin logout error:", err);
    res.status(500).json({ message: "Server error" });
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

// Get all authority users
router.get('/users', async (req, res) => {
  try {
    const users = await AuthorityModel.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get all myvault users
router.get('/users-myvault', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// GET single authority user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await AuthorityModel.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// PUT update authority user
router.put('/users/:id', async (req, res) => {
  try {
    const { username, password } = req.body;
    const updateData = { username };
    
    // Hash password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const user = await AuthorityModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE authority user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await AuthorityModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

//myvault user delete
router.delete('/delete/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne(); // or User.findByIdAndDelete(userId)
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;