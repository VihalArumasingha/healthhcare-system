import { useEffect, useState } from "react";
import axios from "axios";
import API from "../services/doctorApi";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchData = async () => {
    try {
      // 🔥 Step 1: get logged-in doctor
      const docRes = await API.get("/me");
      const doctorId = docRes.data._id; // ✅ Mongo ID

      console.log("👨‍⚕️ Doctor /me response:", docRes.data);
      console.log("🔍 Fetching appointments with doctorId:", doctorId);

      // 🔥 Step 2: fetch appointments
      const res = await axios.get(
       `${import.meta.env.VITE_APPOINTMENT_API}/doctor/${doctorId}`
      );

      console.log("📋 Appointments response:", res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error("❌ Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    await API.patch(
       `${import.meta.env.VITE_APPOINTMENT_API}/${id}/status`,
      { status }
    );
    fetchData();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appointments</h2>

      {appointments.length === 0 && (
        <p>No appointments yet</p>
      )}

      {appointments.map(a => (
        <div key={a._id} className="bg-white p-4 rounded shadow mb-4">

          <p><b>{a.name}</b> ({a.age})</p>
          <p>{a.date} - {a.time}</p>
          <p>{a.symptoms}</p>

          {a.report && (
            <a
              href={`http://localhost:5002/uploads/${a.report}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500"
            >
              View Report
            </a>
          )}

          <p>Status: {a.status}</p>

          <div className="mt-2">
            <button
              onClick={() => updateStatus(a._id, "CONFIRMED")}
              className="bg-green-500 text-white px-3 py-1 mr-2"
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(a._id, "REJECTED")}
              className="bg-red-500 text-white px-3 py-1"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
