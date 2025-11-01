// scripts/createAdmin.js
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../src/models/Admin");

// Prefer DATABASE_ADMIN_URL but fall back to DATABASE_URL so admin ends up in the same DB the server uses
const mongoUri = process.env.DATABASE_ADMIN_URL || process.env.DATABASE_URL;
console.log("Attempting to connect to:", mongoUri);

mongoose.connect(mongoUri)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      mongoose.disconnect();
      return;
    }

    const hashed = await bcrypt.hash("Admin123", 10);
    const admin = new Admin({
      username: "admin",
      password: hashed,
    });

    await admin.save();
    console.log("Admin created successfully!");
    console.log("Username:", admin.username);
    console.log("You can now log in with:");
    console.log("Username: admin");
    console.log("Password: Admin123");
  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
};

createAdmin();