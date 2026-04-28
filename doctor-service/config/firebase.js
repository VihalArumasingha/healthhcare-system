const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// In production, use environment variables for service account details
// For now, we assume the JSON file is in the config folder
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
