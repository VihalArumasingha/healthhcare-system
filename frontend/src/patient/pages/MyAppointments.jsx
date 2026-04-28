import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CreditCard, Loader2, Video } from "lucide-react";
import { auth } from "../../config/firebase";
import patientApi from "../services/patientApi";
import { listSessions } from "../../telemedicine/services/telemedicineApi";

const CLOSED_STATUSES = ["ENDED", "CANCELLED"];
const DEFAULT_CONSULTATION_FEE = 2000;

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [sessionsByAppointment, setSessionsByAppointment] = useState({});
  const [loading, setLoading] = useState(true);

  const patientId = auth.currentUser?.uid || "";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [appointmentsResponse, sessions] = await Promise.all([
          patientApi.get("/appointments/patient/me"),
          listSessions({ patientId })
        ]);

        const appointmentItems = appointmentsResponse.data || [];
        setAppointments(appointmentItems);

        const mappedSessions = {};
        (sessions || []).forEach((session) => {
          if (!session?.appointmentId) return;

          const existing = mappedSessions[session.appointmentId];
          if (!existing || new Date(session.createdAt) > new Date(existing.createdAt)) {
            mappedSessions[session.appointmentId] = session;
          }
        });

        setSessionsByAppointment(mappedSessions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Appointments</h1>
        <p className="mt-1 text-sm text-slate-500">Join telemedicine sessions from your confirmed appointments.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-2xl bg-white p-4 text-slate-600 shadow-sm ring-1 ring-slate-100">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading appointments...
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm ring-1 ring-slate-100">
          No appointments yet.
        </div>
      )}

      <div className="space-y-4">
        {appointments.map((appointment) => {
          const session = sessionsByAppointment[appointment._id];
          const isConfirmed = appointment.status === "CONFIRMED";
          const isPendingPayment = appointment.status === "PENDING_PAYMENT";
          const sessionAvailable = isConfirmed && session && !CLOSED_STATUSES.includes(session.status);
          const paymentAmount = appointment.amount || DEFAULT_CONSULTATION_FEE;

          return (
            <article key={appointment._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Appointment {appointment._id}</h2>
                  <p className="mt-1 text-sm text-slate-500">Doctor: {appointment.doctorId}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white ${
                  appointment.status === "CONFIRMED"
                    ? "bg-emerald-500"
                    : appointment.status === "PENDING_PAYMENT"
                      ? "bg-orange-500"
                    : appointment.status === "REJECTED"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                }`}>
                  {appointment.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoRow icon={Calendar} label="Date" value={appointment.date || "-"} />
                <InfoRow icon={Clock} label="Time" value={appointment.time || "-"} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {sessionAvailable ? (
                  <button
                    onClick={() => navigate(`/telemedicine/${session._id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-400"
                  >
                    <Video className="h-4 w-4" /> Join Telemedicine
                  </button>
                ) : isPendingPayment ? (
                  <button
                    onClick={() =>
                      navigate("/payment", {
                        state: {
                          appointmentId: appointment._id,
                          amount: paymentAmount
                        }
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-500"
                  >
                    <CreditCard className="h-4 w-4" /> Complete Payment
                  </button>
                ) : !isConfirmed ? (
                  <span className="rounded-2xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
                    {appointment.status === "REJECTED" ? "Appointment was rejected" : "Awaiting doctor confirmation"}
                  </span>
                ) : (
                  <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                    Waiting for doctor to create telemedicine session
                  </span>
                )}

                {session && (
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Session: {session.status}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
        <Icon className="h-4 w-4 text-slate-400" /> {value}
      </p>
    </div>
  );
}
