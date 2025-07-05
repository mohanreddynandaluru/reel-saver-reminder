// backend/middleware/authMiddleware.js
const admin = require("../firebase");

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  // validate token middleware
  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
}

module.exports = verifyToken;
