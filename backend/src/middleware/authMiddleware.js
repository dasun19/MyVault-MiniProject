const jwt = require("jsonwebtoken");
const AdminModel = require("../models/Admin");
const AuthorityModel = require("../models/Authority");


// COMMON TOKEN VERIFIER

const verifyToken = (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return { error: "No token provided" };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { decoded };
  } catch {
    return { error: "Invalid or expired token" };
  }
};

// MIDDLEWARE: Only Admin Can Access

const requireAdmin = async (req, res, next) => {
  const { decoded, error } = verifyToken(req, res);
  if (error) return res.status(401).json({ message: error });

  if (decoded.role !== "admin")
    return res.status(403).json({ message: "Access denied: Admin only" });

  const admin = await AdminModel.findById(decoded.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  // Check token version for invalidation
  if (admin.tokenVersion !== decoded.v)
    return res.status(401).json({ message: "Token no longer valid (logout detected)" });

  req.admin = admin;
  next();
};


// MIDDLEWARE: Only Authority Can Access

const requireAuthority = async (req, res, next) => {
  const { decoded, error } = verifyToken(req, res);
  if (error) return res.status(401).json({ message: error });

  if (decoded.role !== "authority")
    return res.status(403).json({ message: "Access denied: Authority only" });

  const authority = await AuthorityModel.findById(decoded.id);
  if (!authority) return res.status(404).json({ message: "Authority user not found" });

  if (authority.tokenVersion !== decoded.v)
    return res.status(401).json({ message: "Token no longer valid (logout detected)" });

  req.authority = authority;
  next();
};

module.exports = { requireAdmin, requireAuthority };
