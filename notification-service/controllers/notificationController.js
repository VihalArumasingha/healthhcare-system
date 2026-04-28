const { sendEmail } = require("../services/emailService");
const { sendSMS } = require("../services/smsService");

// 🔥 Reusable notification helper (IMPORTANT for clean architecture)
const notifyUser = async (email, phone, subject, message) => {
  await Promise.allSettled([
    sendEmail(email, subject, message),
    sendSMS(phone, message)
  ]);
};

// ✅ Appointment Created
exports.appointmentCreated = async (req, res) => {
  try {
    const { email, phone, name, doctorEmail, doctorPhone, doctorName, date, time } = req.body;

    const patientMessage = `Hi ${name}, your appointment is booked on ${date} at ${time}`;
    
    // Notify Patient
    await notifyUser(
      email,
      phone,
      "Appointment Confirmation",
      patientMessage
    );
    console.log(`Notification sent for appointmentCreated (Patient) → ${email}`);

    // Notify Doctor
    if (doctorEmail || doctorPhone) {
      const docNameStr = doctorName || "Doctor";
      const doctorMessage = `Hi ${docNameStr}, a new appointment has been booked by ${name} on ${date} at ${time}`;
      await notifyUser(
        doctorEmail,
        doctorPhone,
        "New Appointment Booked",
        doctorMessage
      );
      console.log(`Notification sent for appointmentCreated (Doctor) → ${doctorEmail}`);
    }

    res.json({ message: "Notification sent successfully" });

  } catch (err) {
    console.error("appointmentCreated error:", err.message);
    res.status(500).json({ error: "Notification failed" });
  }
};

// ✅ Appointment Status Update
exports.appointmentStatus = async (req, res) => {
  try {
    const { email, phone, name, status, doctorEmail, doctorPhone, doctorName } = req.body;

    const patientMessage = `Hi ${name}, your appointment is ${status}`;

    await notifyUser(
      email,
      phone,
      "Appointment Status Update",
      patientMessage
    );

    if (doctorEmail || doctorPhone) {
      const docName = doctorName || "Doctor";
      const doctorMessage = `Hi ${docName}, the appointment for ${name} is now ${status}.`;
      await notifyUser(
        doctorEmail,
        doctorPhone,
        "Appointment Status Update",
        doctorMessage
      );
      console.log(`Notification sent for appointmentStatus → ${doctorEmail}`);
    }

    console.log(`Notification sent for appointmentStatus → ${email}`);

    res.json({ message: "Notification sent successfully" });

  } catch (err) {
    console.error("appointmentStatus error:", err.message);
    res.status(500).json({ error: "Notification failed" });
  }
};

// ✅ Prescription Added
exports.prescriptionAdded = async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    const message = `Hi ${name}, your prescription is ready`;

    await notifyUser(
      email,
      phone,
      "Prescription Update",
      message
    );

    console.log(`Notification sent for prescriptionAdded → ${email}`);

    res.json({ message: "Notification sent successfully" });

  } catch (err) {
    console.error("prescriptionAdded error:", err.message);
    res.status(500).json({ error: "Notification failed" });
  }
};