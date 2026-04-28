import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, PhoneCall, Mic, MicOff, Camera, CameraOff, Plus, RefreshCw, Copy } from "lucide-react";
import axios from "axios";
import { auth } from "../../config/firebase";
import { createSession, generateJoinToken, listSessions, updateSessionStatus } from "../../telemedicine/services/telemedicineApi";
import doctorAPI from "../services/doctorApi";

const initialForm = {
  appointmentId: "",
  patientId: "",
  provider: "jitsi",
  channelName: "",
  role: "host",
  expireInSeconds: 3600
};

export default function TelemedicinePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [acceptedAppointments, setAcceptedAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [previewReady, setPreviewReady] = useState(false);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const currentUserId = auth.currentUser?.uid || "doctor";

  const reloadSessions = async () => {
    try {
      const data = await listSessions({ doctorId: currentUserId });
      setSessions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAcceptedAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const docRes = await doctorAPI.get("/me");
      const doctorMongoId = docRes.data?._id;

      if (!doctorMongoId) {
        setAcceptedAppointments([]);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_APPOINTMENT_API}/doctor/${doctorMongoId}`);
      const confirmed = (response.data || []).filter((item) => item.status === "CONFIRMED");
      setAcceptedAppointments(confirmed);

      if (confirmed.length > 0) {
        setForm((prev) => {
          if (prev.patientId && prev.appointmentId) return prev;
          return {
            ...prev,
            patientId: confirmed[0].patientId || "",
            appointmentId: confirmed[0]._id || ""
          };
        });
      }
    } catch (error) {
      console.error(error);
      setAcceptedAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    reloadSessions();
    loadAcceptedAppointments();
  }, []);

  useEffect(() => {
    const initLocalPreview = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError("Camera preview is not supported in this browser.");
        return;
      }

      try {
        setMediaError("");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;

        const firstVideoTrack = stream.getVideoTracks()[0];
        const firstAudioTrack = stream.getAudioTracks()[0];
        setCameraOn(firstVideoTrack ? firstVideoTrack.enabled : false);
        setMicOn(firstAudioTrack ? firstAudioTrack.enabled : false);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setPreviewReady(true);
      } catch (error) {
        setPreviewReady(false);
        setMediaError(error.message || "Unable to access camera and microphone.");
      }
    };

    initLocalPreview();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  const activeSessions = useMemo(() => sessions.slice(0, 6), [sessions]);

  const handlePatientSelection = (appointmentId) => {
    const selected = acceptedAppointments.find((item) => item._id === appointmentId);
    if (!selected) {
      setForm((prev) => ({ ...prev, patientId: "", appointmentId: "" }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      patientId: selected.patientId || "",
      appointmentId: selected._id
    }));
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const nextState = !micOn;
    audioTracks.forEach((track) => {
      track.enabled = nextState;
    });
    setMicOn(nextState);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;

    const nextState = !cameraOn;
    videoTracks.forEach((track) => {
      track.enabled = nextState;
    });
    setCameraOn(nextState);
  };

  const handleCreateSession = async (event) => {
    event.preventDefault();
    setLoading(true);
    setTokenData(null);

    try {
      const session = await createSession({
        appointmentId: form.appointmentId,
        doctorId: currentUserId,
        patientId: form.patientId,
        provider: form.provider,
        channelName: form.channelName,
        metadata: { source: "frontend" }
      });

      setSelectedSession(session);
      setForm((prev) => ({ ...prev, channelName: session.channelName }));
      await reloadSessions();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || "Failed to create telemedicine session");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async (session) => {
    try {
      setActionLoading(true);
      const data = await generateJoinToken(session._id, {
        uid: currentUserId,
        role: form.role,
        expireInSeconds: Number(form.expireInSeconds)
      });
      setTokenData(data);
      setSelectedSession(session);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || "Failed to generate join token");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatus = async (session, status) => {
    try {
      setActionLoading(true);
      const updated = await updateSessionStatus(session._id, status);
      setSelectedSession(updated);
      await reloadSessions();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message || "Failed to update session status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!tokenData?.token) return;
    await navigator.clipboard.writeText(tokenData.token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.16),_transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] p-8 md:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-sky-200">
              <Video className="h-3.5 w-3.5" /> Telemedicine Control Room
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Manage live sessions, join tokens, and call controls.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Create a telemedicine session from an appointment, issue a provider token, and open the shared room. The UI keeps the camera and microphone controls visible so the frontend matches the backend flow.
            </p>

            <form onSubmit={handleCreateSession} className="mt-8 space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Appointment ID">
                  <input
                    value={form.appointmentId}
                    readOnly
                    className={`${inputClass} cursor-not-allowed opacity-80`}
                    placeholder="Auto from accepted appointment"
                  />
                </Field>
                <Field label="Patient ID">
                  <select
                    value={form.appointmentId}
                    onChange={(event) => handlePatientSelection(event.target.value)}
                    className={inputClass}
                    disabled={appointmentsLoading || acceptedAppointments.length === 0}
                  >
                    {appointmentsLoading && <option value="">Loading accepted appointments...</option>}
                    {!appointmentsLoading && acceptedAppointments.length === 0 && <option value="">No accepted appointments found</option>}
                    {!appointmentsLoading && acceptedAppointments.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.patientId || "Unknown patient"} ({item.date} {item.time})
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Provider">
                  <select value={form.provider} onChange={(event) => setForm((prev) => ({ ...prev, provider: event.target.value }))} className={inputClass}>
                    <option value="jitsi">Jitsi</option>
                  </select>
                </Field>
                <Field label="Channel name">
                  <input value={form.channelName} onChange={(event) => setForm((prev) => ({ ...prev, channelName: event.target.value }))} className={inputClass} placeholder="optional custom channel" />
                </Field>
                <Field label="Role">
                  <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className={inputClass}>
                    <option value="host">Host</option>
                    <option value="audience">Audience</option>
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                <Field label="Token expiry (seconds)">
                  <input type="number" min="60" value={form.expireInSeconds} onChange={(event) => setForm((prev) => ({ ...prev, expireInSeconds: event.target.value }))} className={inputClass} />
                </Field>
                <div className="flex items-end">
                  <button type="submit" disabled={loading || !form.appointmentId || !form.patientId} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60">
                    <Plus className="h-4 w-4" /> {loading ? "Creating..." : "Create Session"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="grid gap-4 self-start">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Current session</p>
              {selectedSession ? (
                <div className="mt-4 space-y-3 text-sm">
                  <p className="text-lg font-black text-white">{selectedSession.channelName}</p>
                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div className="rounded-2xl bg-slate-900/70 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</p>
                      <p className="mt-1 font-bold text-white">{selectedSession.status}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/70 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Provider</p>
                      <p className="mt-1 font-bold text-white">{selectedSession.provider}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleGenerateToken(selectedSession)} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-slate-100 disabled:opacity-60">
                      <RefreshCw className="h-4 w-4" /> Get Token
                    </button>
                    <button onClick={() => navigate(`/telemedicine/${selectedSession._id}`)} className="inline-flex items-center gap-2 rounded-2xl bg-sky-400 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-sky-300">
                      <PhoneCall className="h-4 w-4" /> Open Room
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Create a session to generate a room token and open the call UI.</p>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Join token</p>
              {tokenData?.token ? (
                <div className="mt-4 space-y-3">
                  <pre className="max-h-36 overflow-auto rounded-2xl bg-slate-950/80 p-4 text-[11px] leading-5 text-slate-200 break-all whitespace-pre-wrap">{tokenData.token}</pre>
                  <div className="flex items-center gap-3">
                    <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-2xl bg-teal-400 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-teal-300">
                      <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy token"}
                    </button>
                    <span className="text-xs text-slate-400">Channel: {tokenData.channelName}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Generate a token to let the doctor or patient join the room.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">Recent Sessions</h2>
            <button onClick={reloadSessions} className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">Refresh</button>
          </div>

          <div className="mt-5 space-y-3">
            {activeSessions.length === 0 && <p className="text-sm text-slate-500">No sessions yet.</p>}
            {activeSessions.map((session) => (
              <div key={session._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{session.channelName}</p>
                    <p className="text-xs text-slate-500">{session.appointmentId} · {session.provider}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">{session.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => handleGenerateToken(session)} className="rounded-xl bg-sky-400 px-3 py-2 text-xs font-black text-slate-950">Token</button>
                  <button onClick={() => handleStatus(session, "LIVE")} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white">Start</button>
                  <button onClick={() => handleStatus(session, "ENDED")} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white">End</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">Video Call UI</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Local preview</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900 p-4">
              <div className="relative h-56 overflow-hidden rounded-[1.25rem] border border-dashed border-white/10 bg-gradient-to-br from-slate-800 to-slate-900">
                {previewReady ? (
                  <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <div>
                      <Video className="mx-auto h-12 w-12 text-sky-300" />
                      <p className="mt-3 text-sm font-bold text-slate-100">Camera preview unavailable</p>
                      <p className="mt-1 text-xs text-slate-400">{mediaError || "Allow camera and microphone access to start preview."}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <ControlButton active={micOn} onClick={toggleMic} activeLabel="Mic on" inactiveLabel="Mic off" icon={micOn ? Mic : MicOff} disabled={!previewReady} />
              <ControlButton active={cameraOn} onClick={toggleCamera} activeLabel="Camera on" inactiveLabel="Camera off" icon={cameraOn ? Camera : CameraOff} disabled={!previewReady} />
              {!previewReady && <p className="text-xs text-slate-300">Enable permissions in browser to activate controls.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function ControlButton({ active, onClick, activeLabel, inactiveLabel, icon: Icon, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${active ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-white/10 text-white hover:bg-white/15"} disabled:cursor-not-allowed disabled:opacity-60`}>
      <Icon className="h-4 w-4" /> {active ? activeLabel : inactiveLabel}
    </button>
  );
}

const inputClass = "w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20";
