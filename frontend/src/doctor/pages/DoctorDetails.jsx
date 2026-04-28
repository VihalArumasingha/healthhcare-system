import { useEffect, useState } from "react";
import API from "../services/doctorApi";
import { useParams, useNavigate } from "react-router-dom";

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    API.get(`/${id}`).then(res => setDoctor(res.data));

    API.get(`/${id}/availability`)
      .then(res => setAvailability(res.data.availability));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        {/* 🔹 PROFILE HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6">
          
          {/* Image */}
          <div className="flex justify-center md:block">
            <img
              src="https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80"
              className="w-32 h-32 rounded-full border-4 border-blue-100"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">
              {doctor?.name}
            </h2>

            <p className="text-blue-500 mt-1">
              {doctor?.specialty}
            </p>

            <p className="text-gray-600 mt-2">
              {doctor?.qualifications?.join(", ")}
            </p>

            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                🏥 {doctor?.hospital}
              </span>

              <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                ⏳ {doctor?.experience} yrs exp
              </span>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold">
                💰 Rs. {doctor?.consultationFee}
              </span>
            </div>
          </div>
        </div>

        {/* 🔹 BIO */}
        <div className="bg-white rounded-2xl shadow p-5 mt-6">
          <h3 className="font-bold text-lg mb-2">About Doctor</h3>
          <p className="text-gray-600">
            {doctor?.bio || "No bio available"}
          </p>
        </div>

        {/* 🔹 AVAILABILITY */}
        <div className="bg-white rounded-2xl shadow p-5 mt-6">
          <h3 className="font-bold text-lg mb-4">Available Time Slots</h3>

          {availability.length === 0 && (
            <p className="text-gray-500">No availability set</p>
          )}

          {availability.map(day => (
            <div key={day.date} className="mb-5">

              {/* Date */}
              <h4 className="text-gray-700 font-semibold">
                📅 {day.date}
              </h4>

              {/* Slots */}
              <div className="flex flex-wrap gap-2 mt-3">
                {day.slots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={slot.isBooked}
                    onClick={() =>
                      navigate(`/book/${id}`, {
                        state: { date: day.date, time: slot.time }
                      })
                    }
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      slot.isBooked
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-200 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
