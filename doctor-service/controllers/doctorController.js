const Doctor = require("../models/Doctor");


// 🔹 Create Doctor Profile (AFTER Firebase register)
exports.createDoctorProfile = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ firebaseId: req.user.uid });

    if (existing) {
      return res.status(400).json({ message: "Profile exists" });
    }

    const doctor = new Doctor({
      firebaseId: req.user.uid,
      ...req.body
    });

    await doctor.save();

    res.json(doctor);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Get all doctors (public)
exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
};


// 🔹 Get logged-in doctor (Firebase)
exports.getMyProfile = async (req, res) => {
  const doctor = await Doctor.findOne({ firebaseId: req.user.uid });

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  console.log("👨‍⚕️ Doctor /me endpoint returning:");
  console.log("  - firebaseId:", doctor.firebaseId);
  console.log("  - MongoDB _id:", doctor._id);
  console.log("  - Doctor object:", doctor);

  res.json(doctor);
};


// 🔹 Update profile
exports.updateProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { firebaseId: req.user.uid },
      req.body,
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(doctor);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Add Availability
exports.addAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, slotDuration } = req.body;

    const doctor = await Doctor.findOne({ firebaseId: req.user.uid });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const exists = doctor.availability.find(d => d.date === date);
    if (exists) {
      return res.status(400).json({ message: "Date already exists" });
    }

    const duration = slotDuration || 30;

    const generateSlots = (start, end, duration) => {
      const slots = [];
      let current = new Date(`1970-01-01T${start}:00`);
      const endObj = new Date(`1970-01-01T${end}:00`);

      while (current < endObj) {
        slots.push({
          time: current.toTimeString().slice(0, 5),
          isBooked: false,
        });

        current.setMinutes(current.getMinutes() + duration);
      }

      return slots;
    };

    const slots = generateSlots(startTime, endTime, duration);

    doctor.availability.push({ date, slots });

    await doctor.save();

    res.json({
      message: "Availability added",
      availability: doctor.availability,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Get Doctor Availability (public)
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      doctorId: doctor._id,
      availability: doctor.availability,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Get Doctor by ID (public)
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Book Slot (called by appointment service)
exports.bookSlot = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    console.log("📝 Book Slot Request:");
    console.log("   doctorId:", doctorId, "(type:", typeof doctorId + ")");
    console.log("   date:", date, "(type:", typeof date + ")");
    console.log("   time:", time, "(type:", typeof time + ")");

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    console.log("📋 Doctor availability data:");
    doctor.availability.forEach(day => {
      console.log(`   - Date: "${day.date}"`);
      day.slots.forEach(slot => {
        console.log(`     - Time: "${slot.time}", isBooked: ${slot.isBooked}`);
      });
    });

    const day = doctor.availability.find(d => {
      console.log(`   Checking: "${d.date}" === "${date}" ? ${d.date === date}`);
      return d.date === date;
    });

    if (!day) {
      console.error("❌ Date not found in availability");
      return res.status(404).json({ message: "Slot not found - date not available" });
    }

    const slot = day.slots.find(s => {
      console.log(`   Checking time: "${s.time}" === "${time}" ? ${s.time === time}`);
      return s.time === time;
    });

    if (!slot) {
      console.error("❌ Time not found for this date");
      return res.status(404).json({ message: "Slot not found - time not available" });
    }

    if (slot.isBooked) {
      console.error("❌ Slot already booked");
      return res.status(400).json({ message: "Already booked" });
    }

    slot.isBooked = true;
    await doctor.save();

    console.log("✅ Slot booked successfully");
    res.json({ message: "Slot booked successfully" });

  } catch (err) {
    console.error("❌ Book slot error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Free Slot
exports.freeSlot = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    const doctor = await Doctor.findById(doctorId);

    const day = doctor.availability.find(d => d.date === date);
    const slot = day?.slots.find(s => s.time === time);

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.isBooked = false;

    await doctor.save();

    res.json({ message: "Slot freed successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Delete Availability
exports.deleteAvailability = async (req, res) => {
  try {
    const { date } = req.body;

    const doctor = await Doctor.findOne({ firebaseId: req.user.uid });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.availability = doctor.availability.filter(
      (d) => d.date !== date
    );

    await doctor.save();

    res.json({ message: "Availability removed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Update Availability (SAFE)
exports.updateAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, slotDuration } = req.body;

    const doctor = await Doctor.findOne({ firebaseId: req.user.uid });

    const day = doctor.availability.find(d => d.date === date);

    if (!day) {
      return res.status(404).json({ message: "Date not found" });
    }

    const duration = slotDuration || 30;

    const generateSlots = (start, end, duration) => {
      const slots = [];
      let current = new Date(`1970-01-01T${start}:00`);
      const endObj = new Date(`1970-01-01T${end}:00`);

      while (current < endObj) {
        slots.push(current.toTimeString().slice(0, 5));
        current.setMinutes(current.getMinutes() + duration);
      }

      return slots;
    };

    const newTimes = generateSlots(startTime, endTime, duration);

    const bookedSlots = day.slots.filter(s => s.isBooked);

    const newSlots = newTimes.map(time => ({
      time,
      isBooked: false,
    }));

    const map = new Map();

    newSlots.forEach(s => map.set(s.time, s));
    bookedSlots.forEach(s => map.set(s.time, s));

    day.slots = Array.from(map.values()).sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    await doctor.save();

    res.json({
      message: "Availability updated safely",
      slots: day.slots,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
