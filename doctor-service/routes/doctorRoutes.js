const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorController");
const { verifyToken } = require("../middleware/authMiddleware");


router.get("/", controller.getDoctors);

// NEW
router.get("/me", verifyToken, controller.getMyProfile);
router.put("/me", verifyToken, controller.updateProfile);
router.post("/profile", verifyToken, controller.createDoctorProfile);

router.post("/availability", verifyToken, controller.addAvailability);


router.get("/:id/availability", controller.getDoctorAvailability);
router.get("/:id", controller.getDoctorById);

router.patch("/book-slot", controller.bookSlot);
router.patch("/free-slot", controller.freeSlot);

router.delete("/availability", verifyToken, controller.deleteAvailability);
router.patch("/availability/update", verifyToken, controller.updateAvailability);

module.exports = router;