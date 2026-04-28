const TelemedicineSession = require("../models/TelemedicineSession");
const { generateJoinToken } = require("../services/tokenService");

const buildChannelName = (appointmentId) => {
  return `session-${appointmentId}-${Date.now()}`;
};

const normalizeChannelName = (value) => {
  const room = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  return room || buildChannelName("room");
};

exports.createSession = async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, provider = "jitsi", channelName, metadata } = req.body;

    if (!appointmentId || !doctorId || !patientId) {
      return res.status(400).json({
        message: "appointmentId, doctorId, and patientId are required"
      });
    }

    const existing = await TelemedicineSession.findOne({ appointmentId, status: { $in: ["SCHEDULED", "LIVE"] } });
    if (existing) {
      return res.status(409).json({
        message: "An active telemedicine session already exists for this appointment",
        session: existing
      });
    }

    const session = await TelemedicineSession.create({
      appointmentId,
      doctorId,
      patientId,
      provider,
      channelName: normalizeChannelName(channelName || buildChannelName(appointmentId)),
      metadata: metadata || {}
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listSessions = async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, status } = req.query;

    const query = {};
    if (appointmentId) query.appointmentId = appointmentId;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const sessions = await TelemedicineSession.find(query).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateToken = async (req, res) => {
  try {
    const { uid, role = "audience", expireInSeconds = 3600 } = req.body;

    const session = await TelemedicineSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (["ENDED", "CANCELLED"].includes(session.status)) {
      return res.status(400).json({ message: "Token cannot be generated for ended/cancelled sessions" });
    }

    const tokenPayload = generateJoinToken({
      provider: session.provider,
      channelName: session.channelName,
      uid,
      role,
      expireInSeconds
    });

    res.json({
      sessionId: session._id,
      provider: session.provider,
      channelName: session.channelName,
      ...tokenPayload
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updates = { status };
    if (status === "LIVE") updates.startedAt = new Date();
    if (["ENDED", "CANCELLED"].includes(status)) updates.endedAt = new Date();

    const session = await TelemedicineSession.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: "after" }
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
