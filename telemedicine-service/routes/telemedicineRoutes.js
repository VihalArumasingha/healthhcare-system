const express = require("express");
const controller = require("../controllers/telemedicineController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/sessions", verifyToken, controller.createSession);
router.get("/sessions", verifyToken, controller.listSessions);
router.get("/sessions/:id", verifyToken, controller.getSessionById);
router.patch("/sessions/:id/status", verifyToken, controller.updateSessionStatus);
router.post("/sessions/:id/token", verifyToken, controller.generateToken);

module.exports = router;
