// ============================
// ROLE MIDDLEWARE
// Usage: roleMiddleware("admin") or roleMiddleware("admin", "faculty")
// Must be used AFTER authMiddleware
// ============================

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route is restricted to: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;