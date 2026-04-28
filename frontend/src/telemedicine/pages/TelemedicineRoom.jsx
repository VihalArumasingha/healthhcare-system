import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, CameraOff, Copy, Mic, MicOff, PhoneCall, RefreshCw } from "lucide-react";
import { auth } from "../../config/firebase";
import { generateJoinToken, getSessionById, updateSessionStatus } from "../services/telemedicineApi";
import JitsiMeetComponent from "../components/JitsiMeetComponent";

export default function TelemedicineRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [role, setRole] = useState("host");
  const [joinError, setJoinError] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy token");
  const currentUserId = auth.currentUser?.uid || "guest";
  const isPatientParticipant = session?.patientId === currentUserId;

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSessionById(id);
      setSession(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleJoin = async () => {
    try {
      setJoinError("");
      setJoining(true);

      // Ensure the session is active before requesting a join token.
      const liveSession = await updateSessionStatus(id, "LIVE");
      setSession(liveSession);

      const data = await generateJoinToken(id, {
        uid: currentUserId,
        role: isPatientParticipant ? "audience" : role,
        expireInSeconds: 3600
      });
      if (!data?.token) {
        throw new Error(data?.note || "Jitsi token is required for this room");
      }
      setTokenData(data);
      await loadSession();
      setInCall(true);
    } catch (error) {
      console.error(error);
      setJoinError(error.response?.data?.message || error.message || "Unable to join session");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      setInCall(false);
      if (!isPatientParticipant) {
        await updateSessionStatus(id, "ENDED");
      }
      navigate(-1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleJitsiClose = async () => {
    setInCall(false);
    try {
      if (!isPatientParticipant) {
        await updateSessionStatus(id, "ENDED");
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleCopyToken = async () => {
    if (!tokenData?.token) return;

    try {
      await navigator.clipboard.writeText(tokenData.token);
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy token"), 1500);
    } catch (error) {
      setCopyLabel("Copy failed");
      setTimeout(() => setCopyLabel("Copy token"), 1500);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Loading session...</div>;
  }

  if (!session) {
    return <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm">Session not found.</div>;
  }

  if (inCall && session.provider === "jitsi") {
    return (
      <JitsiMeetComponent
        roomName={tokenData?.channelName || session.channelName}
        userDisplayName={auth.currentUser?.displayName || auth.currentUser?.email || "Guest"}
        jwt={tokenData?.token}
        onClose={handleJitsiClose}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1220px] space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 lg:space-y-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">{session.status}</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] xl:gap-5">
        <section className="rounded-[1.6rem] bg-slate-950 p-4 text-white shadow-xl shadow-slate-900/10 sm:p-5 lg:rounded-[1.8rem] lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Telemedicine Room</p>
              <h1 className="mt-2 break-all text-2xl font-black tracking-tight sm:text-[1.75rem]">{session.channelName}</h1>
              <p className="mt-1 text-sm text-slate-400">Provider: {session.provider} · Appointment {session.appointmentId}</p>
            </div>
            <PhoneCall className="h-8 w-8 text-sky-300 sm:h-9 sm:w-9" />
          </div>

          <div className="mt-4 grid gap-3 lg:mt-5 md:grid-cols-2 md:gap-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-3 sm:p-4">
              <div className="flex h-56 items-center justify-center rounded-[1rem] border border-dashed border-white/10 bg-black/30 sm:h-60 lg:h-64">
                <div className="text-center">
                  <Camera className="mx-auto h-10 w-10 text-sky-300 sm:h-11 sm:w-11" />
                  <p className="mt-3 text-sm font-bold">Remote participant video</p>
                  <p className="mt-1 text-xs text-slate-400">Click Join Room to open the live call in full screen.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-3 sm:space-y-4 sm:p-4">
              {joinError && <p className="rounded-2xl bg-rose-500/20 px-4 py-3 text-xs font-bold text-rose-100">{joinError}</p>}
              <button onClick={() => setMicOn((prev) => !prev)} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${micOn ? "bg-emerald-500 text-white" : "bg-white/10 text-white"}`}>
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {micOn ? "Mic on" : "Mic off"}
              </button>
              <button onClick={() => setCameraOn((prev) => !prev)} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${cameraOn ? "bg-sky-400 text-slate-950" : "bg-white/10 text-white"}`}>
                {cameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                {cameraOn ? "Camera on" : "Camera off"}
              </button>
              <button onClick={handleJoin} disabled={joining} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100 disabled:opacity-60">
                <RefreshCw className="h-4 w-4" /> {joining ? "Joining..." : "Join Room"}
              </button>
              <button onClick={handleLeave} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-400">
                Leave Call
              </button>
              <p className="text-center text-[11px] font-bold text-slate-300">Tip: allow camera and microphone permission when prompted.</p>
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:space-y-5">
          <div className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5 lg:rounded-[1.8rem] lg:p-6">
            <h2 className="text-lg font-black text-slate-900">Session Details</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Detail label="Status" value={session.status} />
              <Detail label="Provider" value={session.provider} />
              <Detail label="Patient ID" value={session.patientId} />
              <Detail label="Doctor ID" value={session.doctorId} />
              <Detail label="Channel" value={session.channelName} />
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-slate-900 p-4 text-white shadow-xl shadow-slate-900/10 sm:p-5 lg:rounded-[1.8rem] lg:p-6">
            <h2 className="text-lg font-black">Join Token</h2>
            <p className="mt-2 text-sm text-slate-300">A token is generated automatically when you join. Use this section only for troubleshooting.</p>
            <div className="mt-4 rounded-2xl bg-slate-950/70 p-4">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Role</label>
              <select value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none">
                <option value="host">Host</option>
                <option value="audience">Audience</option>
              </select>
            </div>
            {tokenData?.token ? (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <button onClick={() => setShowToken((prev) => !prev)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black transition hover:bg-white/20">
                    {showToken ? "Hide token" : "Show token"}
                  </button>
                  <button onClick={handleCopyToken} className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-sky-300">
                    <Copy className="h-3.5 w-3.5" /> {copyLabel}
                  </button>
                </div>
                {showToken && (
                  <pre className="max-h-40 overflow-auto rounded-2xl bg-black/30 p-4 text-[11px] leading-5 text-slate-200 break-all whitespace-pre-wrap">{tokenData.token}</pre>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Press join to generate a token and mark the session live.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}
