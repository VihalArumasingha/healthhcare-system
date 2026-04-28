import { useEffect, useState } from "react";
import API from "../services/doctorApi";
import { useNavigate } from "react-router-dom";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/")
      .then(res => {
        if (Array.isArray(res.data)) {
          setDoctors(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching doctors:", err);
        setLoading(false);
      });
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      
      <h1 className="text-3xl font-bold text-center mb-8">
        Find Your Doctor
      </h1>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by name, specialty, or hospital..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     shadow-sm"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center min-h-96">
          <p className="text-gray-600 text-lg">Loading doctors...</p>
        </div>
      )}

      {!loading && doctors.length === 0 && (
        <div className="flex justify-center items-center min-h-96">
          <p className="text-gray-600 text-lg">No doctors available yet. Newly registered doctors must complete profile setup.</p>
        </div>
      )}

      {!loading && filteredDoctors.length === 0 && doctors.length > 0 && (
        <div className="flex justify-center items-center min-h-96">
          <p className="text-gray-600 text-lg">No doctors match your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {filteredDoctors.map(doc => (
          <div
            key={doc._id}
            onClick={() => navigate(`/doctor/${doc._id}`)}
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer 
                       hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Profile Image */}
            <div className="flex justify-center">
              <img
                src="https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80"
                alt="doctor"
                className="w-24 h-24 rounded-full border-4 border-blue-100"
              />
            </div>

            {/* Info */}
            <div className="text-center mt-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {doc.name || "Doctor Name"}
              </h2>

              <p className="text-blue-500 text-sm mt-1">
                {doc.specialty || "General"}
              </p>

              <p className="text-gray-500 text-sm mt-2">
                {doc.hospital || "Hospital"}
              </p>

              <p className="text-gray-600 text-sm mt-1">
                {doc.experience || 0} years experience
              </p>

              <p className="mt-3 font-bold text-green-600">
                Rs. {doc.consultationFee || "N/A"}
              </p>
            </div>

            {/* Button */}
            <div className="mt-4">
              <button
                className="w-full bg-blue-500 text-white py-2 rounded-lg 
                           hover:bg-blue-600 transition"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
