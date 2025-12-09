// /src/models/Authority.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { authorityConnection } = require("../utils/database");

const authoritySchema = new mongoose.Schema({
    username: { type: String, required: true, unique:true},
    password: { type: String, required: true},
    role: { type: String, enum: ["authority"], default:"authority" },
    tokenVersion: { type: Number, default: 0},
    createdAt: { type:Date, default: Date.now },
});

// Hash password before saving
authoritySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
authoritySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Use separate DB connection
const conn = authorityConnection();
let AuthorityModel;

if (conn) {
  AuthorityModel = conn.models.Authority || conn.model("Authority", authoritySchema);
} else {
  // Fallback to default mongoose connection
  AuthorityModel = mongoose.models.Authority || mongoose.model("Authority", authoritySchema);
}

module.exports = AuthorityModel;