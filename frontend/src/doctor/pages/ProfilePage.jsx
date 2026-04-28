import { useEffect, useState } from "react";
import API from "../services/doctorApi";

export default function ProfilePage() {
  const [doctor, setDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    qualifications: "",
    experience: "",
    hospital: "",
    bio: "",
    consultationFee: ""
  });

  useEffect(() => {
    API.get("/me")
      .then(res => {
        setDoctor(res.data);

        setForm({
          ...res.data,
          qualifications: res.data.qualifications?.join(", ") || ""
        });
      })
      .catch(() => setDoctor(null));
  }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        qualifications: form.qualifications
          ? form.qualifications.split(",").map(q => q.trim())
          : [],
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee)
      };

      if (doctor) {
        await API.put("/me", payload);
        alert("Profile updated!");
      } else {
        await API.post("/profile", payload);
        alert("Profile created!");
      }

      setEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // Auto-enter edit mode if no profile exists
  const isNewProfile = !doctor;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto">

        {/* 🔹 SHOW MESSAGE IF NO PROFILE */}
        {isNewProfile && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="text-blue-700 font-semibold">👋 Welcome! Please create your doctor profile to get started</p>
          </div>
        )}

        {/* 🔹 PROFILE HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">

          <img
            src="https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80"
            className="w-28 h-28 rounded-full border-4 border-blue-100"
          />

          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold">{doctor?.name || "Your Doctor Profile"}</h2>
            <p className="text-blue-500">{doctor?.specialty || "Add your specialty"}</p>

            <p className="text-gray-600 mt-2">
              {doctor?.qualifications?.join(", ") || "Add qualifications"}
            </p>

            {doctor && (
              <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
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
            )}
          </div>
        </div>

        {/* 🔹 DETAILS SECTION */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{isNewProfile ? "Create Profile" : "Profile Details"}</h3>

            {!isNewProfile && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!editMode && !isNewProfile ? (
            <>
              <p className="mb-2"><b>Hospital:</b> {doctor?.hospital}</p>
              <p className="mb-2"><b>Experience:</b> {doctor?.experience} years</p>
              <p className="mb-2"><b>Consultation Fee:</b> Rs. {doctor?.consultationFee}</p>

              <div className="mt-4">
                <p className="font-semibold">Bio</p>
                <p className="text-gray-600">{doctor?.bio || "No bio added"}</p>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                placeholder="Name"
                className="border p-3 rounded-lg"
                value={form.name || ""}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />

              <input
                placeholder="Specialty"
                className="border p-3 rounded-lg"
                value={form.specialty || ""}
                onChange={e => setForm(prev => ({ ...prev, specialty: e.target.value }))}
              />

              <input
                placeholder="Qualifications (comma separated)"
                className="border p-3 rounded-lg"
                value={form.qualifications || ""}
                onChange={e => setForm(prev => ({ ...prev, qualifications: e.target.value }))}
              />

              <input
                type="number"
                placeholder="Experience"
                className="border p-3 rounded-lg"
                value={form.experience || ""}
                onChange={e => setForm(prev => ({ ...prev, experience: e.target.value }))}
              />

              <input
                placeholder="Hospital"
                className="border p-3 rounded-lg"
                value={form.hospital || ""}
                onChange={e => setForm(prev => ({ ...prev, hospital: e.target.value }))}
              />

              <input
                type="number"
                placeholder="Consultation Fee"
                className="border p-3 rounded-lg"
                value={form.consultationFee || ""}
                onChange={e => setForm(prev => ({ ...prev, consultationFee: e.target.value }))}
              />

              <textarea
                placeholder="Bio"
                className="border p-3 rounded-lg md:col-span-2"
                rows={3}
                value={form.bio || ""}
                onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
              />

              <div className="md:col-span-2 flex gap-3 mt-2">
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
