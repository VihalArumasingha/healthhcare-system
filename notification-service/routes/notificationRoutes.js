const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");

// existing routes
router.post("/appointment-created", controller.appointmentCreated);
router.post("/appointment-status", controller.appointmentStatus);
router.post("/prescription", controller.prescriptionAdded);

// ✅ ADD THIS TEST ROUTE
const { sendSMS } = require("../services/smsService");

router.post("/test-sms", async (req, res) => {
  const { phone, message } = req.body;

  try {
    await sendSMS(phone, message);
    res.json({ message: "SMS sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;