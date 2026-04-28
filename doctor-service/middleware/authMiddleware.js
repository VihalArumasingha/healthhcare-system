const admin = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  console.log("🔐 Verifying token...");
  
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  console.log("Authorization header:", authHeader ? "✓ Present" : "✗ Missing");
  console.log("Token:", token ? "✓ Present" : "✗ Missing");

  if (!token) {
    console.log("⚠️ No token provided");
    return res.status(401).json({ 
      message: "Unauthorized - No token provided"
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token verified, uid:", decodedToken.uid);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return res.status(401).json({ 
      message: "Unauthorized - Invalid token",
      error: error.message 
    });
  }
};

module.exports = { verifyToken };
