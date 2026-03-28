const jwt = require("jsonwebtoken");

const parseBearerToken = (value = "") => {
  if (!value.startsWith("Bearer ")) {
    return null;
  }

  return value.split(" ")[1] || null;
};

const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return {
    id: decoded.id,
    role: decoded.role,
  };
};

const authMiddleware = (req, res, next) => {
  try {
    const token = parseBearerToken(req.headers.authorization || "");

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. Token missing or invalid.",
      });
    }

    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized. Token verification failed.",
    });
  }
};

module.exports = authMiddleware;
module.exports.parseBearerToken = parseBearerToken;
module.exports.verifyToken = verifyToken;
