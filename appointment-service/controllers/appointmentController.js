const Appointment = require("../models/Appointment");
const axios = require("axios");

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || "http://localhost:5004/api/doctors";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5006/api/notifications";

console.log("🔗 DOCTOR_SERVICE_URL:", DOCTOR_SERVICE_URL);
console.log("🔗 NOTIFICATION_SERVICE_URL:", NOTIFICATION_SERVICE_URL);

// ✅ Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      time,
      name,
      age,
      symptoms,
      email,
      phone
    } = req.body;

    // 🔹 Validate required fields
    if (!doctorId || !date || !time || !name || !age || !email || !phone || !symptoms) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("📝 Creating appointment with doctorId:", doctorId);
    console.log("📝 Requested slot - Date:", date, "(type:", typeof date + ")");
    console.log("📝 Requested slot - Time:", time, "(type:", typeof time + ")");

    // 🔹 FIRST: Try to book the slot (validates availability)
    console.log("🔹 Attempting to book slot...");
    try {
      await axios.patch(`${DOCTOR_SERVICE_URL}/book-slot`, {
        doctorId,
        date,
        time
      });
      console.log("✅ Slot booked successfully");
    } catch (bookErr) {
      const errorMsg = bookErr.response?.data?.message || bookErr.message;
      console.error("❌ Failed to book slot:", errorMsg);
      return res.status(bookErr.response?.status || 400).json({ 
        error: errorMsg 
      });
    }

    const report = req.file ? req.file.filename : null;

    // 🔹 Get Doctor Details
    let doctorEmail = null;
    let doctorPhone = null;
    let doctorName = null;
    try {
      const docRes = await axios.get(`${DOCTOR_SERVICE_URL}/${doctorId}`);
      if (docRes.data) {
        doctorEmail = docRes.data.email;
        doctorPhone = docRes.data.phone;
        doctorName = docRes.data.name;
      }
    } catch (docErr) {
      console.error("Error fetching doctor details:", docErr.message);
    }

    // 🔹 THEN: Save appointment (only if slot booking succeeded)
    const appointment = new Appointment({
      doctorId,
      patientId: req.user?.firebaseId || "patient123",
      date,
      time,
      name,
      age,
      email,
      phone,
      symptoms,
      report,
      status: "PENDING_PAYMENT"
    });

    await appointment.save();
    
    console.log("✅ Appointment saved:", {
      _id: appointment._id,
      doctorId: appointment.doctorId,
      name: appointment.name
    });

    // 🔹 Send notification (async - don't break main flow)
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/appointment-created`, {
        email,
        phone,
        name,
        doctorId,
        doctorEmail,
        doctorPhone,
        doctorName,
        date,
        time
      });
    } catch (notifyErr) {
      console.error("Notification error:", notifyErr.message);
    }

    res.json(appointment);

  } catch (err) {
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown error";
    console.error("❌ APPOINTMENT ERROR:", {
      message: errorMessage,
      status: statusCode,
      fullError: err.response?.data || err.toString()
    });
    res.status(statusCode).json({ error: errorMessage });
  }
};

// ✅ Get doctor appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    console.log("🔍 Fetching appointments for doctorId:", doctorId);
    console.log("🔍 doctorId type:", typeof doctorId);

    const appointments = await Appointment.find({ doctorId });
    
    console.log(`📋 Query result: Found ${appointments.length} appointments`);
    
    if (appointments.length === 0) {
      console.log("⚠️ NO APPOINTMENTS FOUND!");
      console.log("🔎 Checking ALL appointments in database:");
      const allAppointments = await Appointment.find({});
      console.log(`📊 Total appointments in DB: ${allAppointments.length}`);
      allAppointments.forEach(apt => {
        console.log(`   - doctorId: ${apt.doctorId} (type: ${typeof apt.doctorId}), name: ${apt.name}`);
      });
    } else {
      console.log("✅ Found appointments:");
      appointments.forEach(apt => {
        console.log(`   - ${apt.name}, doctorId: ${apt.doctorId}`);
      });
    }

    res.json(appointments);

  } catch (err) {
    console.error("❌ ERROR fetching doctor appointments:", err.message);
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
    res.status(statusCode).json({ error: errorMessage });
  }
};

// ✅ Update appointment status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, email, phone } = req.body;

    const statusMap = {
      approved: "CONFIRMED",
      confirmed: "CONFIRMED",
      rejected: "REJECTED"
    };

    const normalizedStatus = statusMap[String(status || "").toLowerCase()] || status;

    if (!["PENDING_PAYMENT", "CONFIRMED", "REJECTED"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    // 🔥 If rejected → free slot
    if (normalizedStatus === "REJECTED") {
      await axios.patch(`${DOCTOR_SERVICE_URL}/free-slot`, {
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time
      });
    }

    appointment.status = normalizedStatus;
    await appointment.save();

    const notificationPayload = {
      email: email || appointment.email,
      phone: phone || appointment.phone,
      name: appointment.name,
      status: normalizedStatus
    };

    try {
      if (appointment.doctorId) {
        const docRes = await axios.get(`${DOCTOR_SERVICE_URL}/${appointment.doctorId}`);
        if (docRes.data) {
          notificationPayload.doctorEmail = docRes.data.email;
          notificationPayload.doctorPhone = docRes.data.phone;
          notificationPayload.doctorName = docRes.data.name;
        }
      }
    } catch (docErr) {
      console.error("Error fetching doctor details for notification:", docErr.message);
    }

    // 🔹 Send notification
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/appointment-status`, notificationPayload);
    } catch (notifyErr) {
      console.error("Notification error:", notifyErr.message);
    }

    res.json(appointment);

  } catch (err) {
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
    res.status(statusCode).json({ error: errorMessage });
  }
};

// ✅ Add prescription
exports.addPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { prescription, email, phone } = req.body;

    const appt = await Appointment.findByIdAndUpdate(
      id,
      { prescription },
      { new: true }
    );

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 🔹 Send notification
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/prescription`, {
        email,
        phone,
        name: appt.name
      });
    } catch (notifyErr) {
      console.error("Notification error:", notifyErr.message);
    }

    res.json(appt);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get logged-in patient appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user?.firebaseId;

    if (!patientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ patientId }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
    res.status(statusCode).json({ error: errorMessage });
  }
};