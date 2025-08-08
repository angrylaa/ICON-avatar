// utils/authz.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function requireAuth(req, res, next) {
  // Prefer cookie; fallback to Authorization header
  const token =
    req.cookies?.auth ||
    (req.headers.authorization?.startsWith("Bearer ") &&
      req.headers.authorization.slice(7));

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, JWT_SECRET); // { sub, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role)
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
