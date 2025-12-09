// backend/models/Admin.js
// For webapp admin
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { adminConnection } = require("../utils/database");

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default:"admin", required: true},
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving

 adminSchema.pre("save", async function (next){
  if (!this.isModified("password")) 
    return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

let AdminModel;
try {
  const conn = adminConnection();
  if (conn) {
    AdminModel = conn.models.Admin || conn.model("Admin", adminSchema);
  } else {
    AdminModel = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
  }
} catch (err) {
  // Fallback to default connection in case something goes wrong
  AdminModel = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
}

module.exports = AdminModel;