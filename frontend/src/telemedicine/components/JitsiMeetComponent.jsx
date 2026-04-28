import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const jitsiDomain = import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si";
const jitsiProtocol = import.meta.env.VITE_JITSI_PROTOCOL || "https";
const jitsiPort = import.meta.env.VITE_JITSI_PORT || "";

const hasPort = /:\d+$/.test(jitsiDomain);
const isLocalhost = jitsiDomain === "localhost";
const resolvedDomain = !hasPort && isLocalhost && jitsiPort ? `${jitsiDomain}:${jitsiPort}` : jitsiDomain;

const getScriptCandidates = () => {
  const candidates = [];

  if (isLocalhost && jitsiPort) {
    candidates.push(`http://${jitsiDomain}:${jitsiPort}/external_api.js`);
    candidates.push(`https://${jitsiDomain}/external_api.js`);
  } else {
    candidates.push(`${jitsiProtocol}://${resolvedDomain}/external_api.js`);
  }

  return candidates;
};

export default function JitsiMeetComponent({ roomName, userDisplayName, jwt, onClose, onReady }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [sdkStatus, setSdkStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    setSdkStatus("loading");
    setErrorMessage("");

    const loadJitsi = () => {
      if (!containerRef.current) return;

      const startConference = () => {
        if (!window.JitsiMeetExternalAPI || !containerRef.current) return;

        const useNoSSL = isLocalhost && jitsiPort ? true : jitsiProtocol === "http";

        apiRef.current = new window.JitsiMeetExternalAPI(resolvedDomain, {
          noSSL: useNoSSL,
          roomName: roomName || "default-room",
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          jwt,
          userInfo: {
            displayName: userDisplayName || "Guest"
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startAudioOnly: false,
            disableThirdPartyRequests: true
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            DEFAULT_REMOTE_DISPLAY_NAME: "Participant"
          }
        });

        setSdkStatus("ready");

        apiRef.current.addEventListener("videoConferenceJoined", () => {
          if (onReady) onReady();
        });

        apiRef.current.addEventListener("videoConferenceLeft", () => {
          if (onClose) onClose();
        });

        apiRef.current.addEventListener("readyToClose", () => {
          if (onClose) onClose();
        });
      };

      if (window.JitsiMeetExternalAPI) {
        startConference();
        return;
      }

      const scriptCandidates = getScriptCandidates();
      let currentIndex = 0;

      const loadScript = () => {
        if (currentIndex >= scriptCandidates.length) {
          setSdkStatus("error");
          setErrorMessage("Unable to connect to the video server. Please retry.");
          return;
        }

        const script = document.createElement("script");
        script.src = scriptCandidates[currentIndex];
        script.async = true;
        script.onload = startConference;
        script.onerror = () => {
          script.remove();
          currentIndex += 1;
          loadScript();
        };
        document.body.appendChild(script);
      };

      loadScript();
    };

    loadJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [jwt, onClose, onReady, retryTick, roomName, userDisplayName]);

  const handleClose = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("hangup");
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {sdkStatus !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-white">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-center shadow-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Telemedicine</p>
            <h2 className="mt-2 text-2xl font-black">{sdkStatus === "error" ? "Connection Failed" : "Connecting to Room"}</h2>
            <p className="mt-3 text-sm text-slate-300">
              {sdkStatus === "error"
                ? errorMessage
                : "Please wait while we prepare your camera, microphone, and secure video room."}
            </p>

            {sdkStatus !== "error" && (
              <div className="mx-auto mt-5 h-10 w-10 animate-spin rounded-full border-4 border-sky-400/30 border-t-sky-400" />
            )}

            {sdkStatus === "error" && (
              <button
                onClick={() => setRetryTick((prev) => prev + 1)}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-400"
              >
                Retry Connection
              </button>
            )}

            <p className="mt-4 text-xs text-slate-400">Room: {roomName || "default-room"}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleClose}
        className="absolute right-4 top-4 z-50 rounded-full bg-red-600 p-3 text-white shadow-lg transition hover:bg-red-700"
        aria-label="Close call"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
