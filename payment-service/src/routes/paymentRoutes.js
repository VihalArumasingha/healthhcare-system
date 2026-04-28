const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentController");

router.post("/create", controller.createPayment);
router.post("/confirm", controller.confirmPayment);
router.get("/stats/weekly", controller.getWeeklyRevenue);

module.exports = router;