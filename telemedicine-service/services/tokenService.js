const jwt = require("jsonwebtoken");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const normalizeJitsiRoomName = (value) => {
  const room = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  return room || "default-room";
};

const toAgoraUid = (uid) => {
  const asNumber = Number(uid);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return Math.trunc(asNumber);
  }

  return String(uid).split("").reduce((acc, ch) => {
    return (acc + ch.charCodeAt(0)) % 2147483647;
  }, 0);
};

const generateAgoraToken = ({ channelName, uid, role = "audience", expireInSeconds = 3600 }) => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error("AGORA_APP_ID and AGORA_APP_CERTIFICATE are required for Agora token generation");
  }

  const agoraUid = toAgoraUid(uid || 0);
  const rtcRole = role === "host" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + Number(expireInSeconds);

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    agoraUid,
    rtcRole,
    privilegeExpiredTs
  );

  return {
    token,
    appId,
    uid: agoraUid,
    expiresAt: privilegeExpiredTs
  };
};

const generateJitsiToken = ({ channelName, uid, role = "guest", expireInSeconds = 3600 }) => {
  const appId = process.env.JITSI_APP_ID;
  const appSecret = process.env.JITSI_APP_SECRET;
  const domain = process.env.JITSI_DOMAIN || "meet.jit.si";

  if (!appId || !appSecret) {
    if (domain !== "meet.jit.si") {
      throw new Error("JITSI_APP_ID and JITSI_APP_SECRET are required for self-hosted Jitsi");
    }

    return {
      token: null,
      appId: appId || null,
      domain,
      expiresAt: null,
      note: "JITSI_APP_ID/JITSI_APP_SECRET not configured. Tokenless Jitsi mode is assumed."
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + Number(expireInSeconds);

  const normalizedRoom = normalizeJitsiRoomName(channelName);

  const payload = {
    aud: "jitsi",
    iss: appId,
    sub: domain,
    room: normalizedRoom,
    exp,
    nbf: now,
    context: {
      user: {
        id: String(uid || "guest"),
        moderator: role === "host"
      }
    }
  };

  return {
    token: jwt.sign(payload, appSecret, { algorithm: "HS256" }),
    channelName: normalizedRoom,
    appId,
    domain,
    uid: String(uid || "guest"),
    expiresAt: exp
  };
};

const generateJoinToken = ({ provider, channelName, uid, role, expireInSeconds }) => {
  if (provider === "jitsi") {
    return generateJitsiToken({ channelName, uid, role, expireInSeconds });
  }

  return generateAgoraToken({ channelName, uid, role, expireInSeconds });
};

module.exports = {
  generateJoinToken
};
