const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthorityModel = require("../models/Authority");
const AdminModel = require("../models/Admin");


router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({message: "Username and password required"});

    try {
        const authority = await AuthorityModel.findOne({ username });

        console.log("Authority login attempt:", { username, found: !!authority, role: authority?.role });

        if (!authority) return res.status(400).json({ message: "Invalid credentials"});

        // ✅ Security check: Reject if this is an admin account trying to login as authority
        if (authority.role && authority.role !== "authority") {
            console.log("Role mismatch: found role is", authority.role);
            return res.status(403).json({ message: "This account is registered as admin. Please use admin login." });
        }

        const isMatch = await bcrypt.compare(password, authority.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            {id: authority._id, role: "authority", v: authority.tokenVersion },
            process.env.JWT_SECRET,
            {expiresIn:"15m"}
        );

        res.json({token, user: {id: authority._id, username: authority.username, role: "authority"}, message: "Login successful"});

    } catch (err) {
        console.error("Authority login error:", err);
        res.status(500).json({ message: "Server error: " + err.message});
    }
});

// Log out route

router.post("/logout", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(401).json({ message: "Invalid token" }); }

    const authority = await AuthorityModel.findById(decoded.id);
    if (!authority) return res.status(404).json({ message: "Authority not found" });

    await authority.updateOne({ $inc: { tokenVersion: 1 } });
    res.json({ message: "Logged out (token invalidated)" });
  } catch (err) {
    console.error("Authority logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;