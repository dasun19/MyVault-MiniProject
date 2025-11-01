// backend/models/Admin.js
const mongoose = require("mongoose");
const { adminConnection } = require("../utils/database");

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  // optional email field (not required today)
  email: { type: String, required: false, unique: false },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  // tokenVersion is used to invalidate previously issued JWTs when incremented
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// If an adminConnection exists, register the model on that connection so admin records
// live in the admin DB; otherwise fall back to the default mongoose connection.
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