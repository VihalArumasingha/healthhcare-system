const Payment = require("../models/paymentModel");
const { createPaymentIntent } = require("../services/stripeService");
const axios = require("axios");

const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5070/api/appointments";

exports.createPayment = async (req, res) => {
    try {
        const { appointmentId, patientId, amount } = req.body;

        const paymentIntent = await createPaymentIntent(amount);

        const payment = await Payment.create({
            appointmentId,
            patientId,
            amount,
            transactionId: paymentIntent.id
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentId: payment._id
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔥 VERY IMPORTANT
exports.confirmPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;

        const payment = await Payment.findById(paymentId);
        payment.status = "SUCCESS";
        await payment.save();

        // 🔥 UPDATE APPOINTMENT STATUS
        await axios.patch(
            `${APPOINTMENT_SERVICE_URL}/${payment.appointmentId}/status`,
            { status: "CONFIRMED" }
        );

        res.json({ message: "Payment successful & appointment confirmed" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getWeeklyRevenue = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const payments = await Payment.find({
            status: "SUCCESS",
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: 1 });

        // Group by day
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = {};
        
        // Initialize last 7 days including today
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            weeklyData[dayName] = { name: dayName, revenue: 0, transactions: 0 };
        }

        payments.forEach(p => {
            const dayName = days[new Date(p.createdAt).getDay()];
            if (weeklyData[dayName]) {
                weeklyData[dayName].revenue += p.amount;
                weeklyData[dayName].transactions += 1;
            }
        });

        const chartData = Object.values(weeklyData);
        const totalProfit = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

        res.json({ chartData, totalProfit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};