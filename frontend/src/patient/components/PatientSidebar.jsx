import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Calendar, FileText, Pill, LogOut } from 'lucide-react';
import { subscribeToAuthChanges, logout } from '../../auth/services/authService';
import logo from '../../assets/WebLogo.png';

const PatientSidebar = () => {
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (data) => {
      setUser(data?.user || null);
      if (data?.user) {
        try {
          const token = await data.user.getIdToken();
          const response = await axios.get(`${import.meta.env.VITE_PATIENT_API}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
            setPatientData(response.data);
          }
        } catch (err) {
          console.error('Failed to fetch patient profile for Sidebar:', err);
        }
      }
    });
    return () => unsub();
  }, []);

  const displayName = patientData?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Patient');
  const profileImage = patientData?.profileImage || user?.photoURL;

  const menuItems = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/patient/profile', icon: UserCircle },
    { name: 'Appointments', path: '/my-appointments', icon: Calendar },
    { name: 'Medical Records', path: '/patient/records', icon: FileText },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-teal-100 flex flex-col hidden md:flex h-screen fixed left-0 top-0 transition-transform z-40">
      {/* Logo Area */}
      <Link to="/" className="h-16 flex items-center px-6 border-b border-teal-100 hover:opacity-80 transition-opacity">
        <img 
          src={logo} 
          alt="HealthEase Logo" 
          className="h-8 w-auto mr-2 object-contain" 
          onError={(e) => e.target.style.display = 'none'} 
        />
        <span className="text-xl font-bold text-teal-600 font-sans tracking-tight">HealthEase</span>
      </Link>

      {/* User Info Area */}
      <div className="px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-teal-50 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-teal-600 overflow-hidden mb-4">
            {profileImage ? (
              <img src={profileImage} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <h2 className="text-lg font-black text-slate-800 line-clamp-1 px-2">{displayName}</h2>
          <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1 opacity-70">Patient Account</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-teal-600 text-white font-bold shadow-lg shadow-teal-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`mr-4 w-5 h-5 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-300 group-hover:text-teal-500'
                }`} />
                <span className="text-sm">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-teal-50">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold group"
        >
          <LogOut className="mr-4 w-5 h-5 text-slate-300 group-hover:text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="text-sm">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default PatientSidebar;