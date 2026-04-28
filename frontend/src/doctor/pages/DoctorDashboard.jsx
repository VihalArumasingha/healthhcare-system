import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { Video, ArrowRight } from "lucide-react";

export default function DoctorDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6 grid grid-cols-1 gap-4">
          <Link to="/doctor-dashboard/telemedicine" className="rounded-[2rem] bg-slate-950 text-white p-5 shadow-xl shadow-slate-200/20 hover:bg-slate-900 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Video className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-bold">Telemedicine</p>
                <h2 className="text-lg font-black">Open control room</h2>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300 leading-6">
              Create sessions, generate join tokens, and jump into video consults.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-teal-300 font-bold text-sm">
              Go to telemedicine <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  );
}