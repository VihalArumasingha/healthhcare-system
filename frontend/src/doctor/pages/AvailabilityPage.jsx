import { useEffect, useState } from "react";
import API from "../services/doctorApi";

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    slotDuration: 30
  });

  const fetchData = async () => {
    const res = await API.get("/me");
    setAvailability(res.data.availability || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addAvailability = async () => {
    await API.post("/availability", form);
    fetchData();
  };

  const updateAvailability = async (date) => {
    const startTime = prompt("New start time (HH:mm)");
    const endTime = prompt("New end time (HH:mm)");

    await API.patch("/availability/update", {
      date,
      startTime,
      endTime
    });

    fetchData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Availability</h2>

      {/* ADD NEW */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input type="date" onChange={e => setForm({...form, date: e.target.value})}/>
        <input type="time" onChange={e => setForm({...form, startTime: e.target.value})}/>
        <input type="time" onChange={e => setForm({...form, endTime: e.target.value})}/>
        <button onClick={addAvailability} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
          Add
        </button>
      </div>

      {/* SHOW EXISTING */}
      {availability.map(day => (
        <div key={day.date} className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between">
            <h3 className="font-bold">{day.date}</h3>

            <button
              onClick={() => updateAvailability(day.date)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Update
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {day.slots.map(slot => (
              <span
                key={slot.time}
                className={`px-3 py-1 rounded ${
                  slot.isBooked
                    ? "bg-red-400 text-white"
                    : "bg-green-200"
                }`}
              >
                {slot.time}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}