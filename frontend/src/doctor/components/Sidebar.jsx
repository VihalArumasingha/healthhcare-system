import { Link } from "react-router-dom";
import { Video, LogOut } from "lucide-react";
import { logout } from "../../auth/services/authService";

export default function Sidebar() {
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-64 bg-blue-600 text-white p-5 flex flex-col h-screen">
      <h2 className="text-2xl font-bold mb-6">Doctor Panel</h2>

      <nav className="flex flex-col gap-4 flex-1">
        <Link to="/doctor-dashboard/profile" className="hover:underline">
          Profile
        </Link>

        <Link to="/doctor-dashboard/availability" className="hover:underline">
          Availability
        </Link>
        <Link to="/doctor-dashboard/appointments" className="hover:underline">
          Appointments
        </Link>

        <Link to="/doctor-dashboard/telemedicine" className="hover:underline flex items-center gap-2">
          <Video className="w-4 h-4" /> Telemedicine
        </Link>
      </nav>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded transition-colors font-bold"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
