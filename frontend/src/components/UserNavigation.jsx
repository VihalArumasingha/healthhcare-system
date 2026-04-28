import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { subscribeToAuthChanges, logout } from '../auth/services/authService';
import { User, LayoutDashboard, LogOut, ChevronDown, Bell, Calendar, FileText, Pill } from 'lucide-react';
// IMPORTANT: Update this extension (.png, .svg) if your logo file is different
import logo from '../assets/WebLogo.png';

const UserNavigation = () => {
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (data) => {
      setUser(data ? { ...data.user, role: data.role } : null);
      if (data?.user && data.role === 'patient') {
        try {
          const token = await data.user.getIdToken();
          const response = await axios.get(`${import.meta.env.VITE_PATIENT_API}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
            setPatientData(response.data);
          }
        } catch (err) {
          console.error('Failed to fetch patient profile for UserNav:', err);
        }
      }
    });
    return () => unsub();
  }, []);

  const displayName = patientData?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'User');
  const profileImage = patientData?.profileImage || user?.photoURL;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      navigate('/login'); // Redirect to login instead of home
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctors', path: '/doctors' },
    { name: 'My Appointments', path: '/my-appointments' },
  ];

  const getLogoLink = () => {
    // Both logged-out users and Patients should go to the public homepage
    if (!user || user.role === 'patient') return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor-dashboard/profile';
    return '/';
  };

  return (
    <nav className="bg-white border-b border-teal-50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getLogoLink()} className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src={logo} 
                alt="HealthEase Logo" 
                className="h-10 w-auto mr-3 object-contain" 
                onError={(e) => e.target.style.display = 'none'} 
              />
              <span className="text-2xl font-bold text-teal-600 hidden sm:block tracking-tight">HealthEase</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'border-teal-500 text-slate-900'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-teal-200'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-5">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2.5 focus:outline-none group p-1 pr-2 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border-2 border-white shadow-sm overflow-hidden transition-transform group-hover:scale-105">
                    {profileImage ? (
                      <img src={profileImage} alt="profile" className="h-full w-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors hidden md:block">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-teal-50 rounded-2xl shadow-2xl py-2.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1.5 bg-slate-50/50">
                      <p className="text-[10px] text-teal-600 uppercase font-black tracking-widest leading-none mb-1">Authenticated</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{user.email}</p>
                    </div>
                    <Link 
                      to="/patient/dashboard" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3 text-teal-500" /> Dashboard
                    </Link>
                    <Link 
                      to="/patient/profile" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all font-semibold"
                    >
                      <User className="w-4 h-4 mr-3 text-teal-500" /> My Profile
                    </Link>
                    <Link 
                      to="/my-appointments" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all font-semibold"
                    >
                      <Calendar className="w-4 h-4 mr-3 text-teal-500" /> Appointments
                    </Link>
                    <Link 
                      to="/patient/records" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all font-semibold"
                    >
                      <FileText className="w-4 h-4 mr-3 text-teal-500" /> Medical Records
                    </Link>
                    <Link 
                      to="/patient/prescriptions" 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all font-semibold"
                    >
                      <Pill className="w-4 h-4 mr-3 text-teal-500" /> Prescriptions
                    </Link>
                    <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all font-bold"
                      >
                        <LogOut className="w-4 h-4 mr-3" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavigation;
