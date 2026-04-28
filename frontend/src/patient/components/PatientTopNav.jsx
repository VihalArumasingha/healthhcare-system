import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { subscribeToAuthChanges, logout } from '../../auth/services/authService';
import { ChevronDown, User, LayoutDashboard, Calendar, FileText, Pill, LogOut, Bell } from 'lucide-react';

const PatientTopNav = () => {
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (data) => {
      setUser(data ? { ...data.user, role: data.role } : null);
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
          console.error('Failed to fetch patient profile for TopNav:', err);
        }
      }
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      unsub();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName = patientData?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Patient');
  const profileImage = patientData?.profileImage || user?.photoURL;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/patient/dashboard': return 'Dashboard';
      case '/patient/profile': return 'My Profile';
      case '/patient/appointments':
      case '/my-appointments': return 'Appointments';
      case '/patient/records': return 'Medical Records';
      case '/patient/prescriptions': return 'Prescriptions';
      default: return 'Overview';
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/patient/profile', icon: User },
    
    { name: 'Appointments', path: '/my-appointments', icon: Calendar },
    { name: 'Medical Records', path: '/patient/records', icon: FileText },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
  ];

  return (
    <header className="h-16 bg-white border-b border-teal-50 flex items-center justify-between px-6 fixed top-0 right-0 left-0 md:left-64 z-[50] transition-all duration-300">
      {/* Left side - Home Link / Page Title */}
      <div className="flex items-center flex-1">
        <Link 
          to="/" 
          className="mr-4 p-2 hover:bg-teal-50 rounded-xl transition-colors md:hidden"
        >
          <span className="text-xl font-black text-teal-600 tracking-tight">H</span>
        </Link>
        <h2 className="text-lg font-black text-slate-800 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right side - Profile & Notifications */}
      <div className="flex items-center space-x-6">
        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center p-1.5 pr-3 rounded-full border border-teal-50 hover:bg-teal-50/50 transition-all bg-slate-50/30 group"
          >
            <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-95 transition-transform">
              {profileImage ? (
                <img src={profileImage} alt="profile" className="h-full w-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors">
              {displayName}
            </span>
            <ChevronDown className={`ml-2 w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Actual Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl shadow-teal-900/10 border border-teal-50 overflow-hidden py-2 animate-in fade-in zoom-in duration-200">
              {/* Header Info */}
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-0.5">Authenticated</p>
                <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
              </div>

              {/* Navigation Links (Synced with Sidebar) */}
              <div className="p-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsDropdownOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-4 rounded-2xl transition-all group ${
                        isActive 
                          ? 'bg-teal-50/50 text-teal-700 font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'
                      }`
                    }
                  >
                    <item.icon className="mr-4 w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                    <span className="text-sm">{item.name}</span>
                  </NavLink>
                ))}
              </div>

              {/* Logout Button */}
              <div className="px-2 pt-2 border-t border-slate-50">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors font-bold group"
                >
                  <LogOut className="mr-4 w-5 h-5 opacity-70 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PatientTopNav;