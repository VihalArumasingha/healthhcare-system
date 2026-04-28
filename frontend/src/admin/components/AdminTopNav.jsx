import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { subscribeToAuthChanges, logout } from '../../auth/services/authService';
import { LayoutDashboard, Users, UserCog, FileText, Settings, LogOut, Bell } from 'lucide-react';

const AdminTopNav = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribeToAuthChanges((data) => {
      setUser(data?.user || null);
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

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin');
  const profileImage = user?.photoURL;

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
      case '/admin/dashboard': return 'Admin Dashboard';
      case '/admin/patients': return 'Manage Patients';
      case '/admin/doctors': return 'Manage Doctors';
      case '/admin/settings': return 'System Settings';
      default: return 'Overview';
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Patients', path: '/admin/patients', icon: Users },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: UserCog },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <header className="h-16 bg-white border-b border-blue-50 flex items-center justify-between px-6 fixed top-0 right-0 left-0 md:left-64 z-[50] transition-all duration-300">
      {/* Left side - Page Title */}
      <div className="flex items-center flex-1">
        <h2 className="text-lg font-black text-slate-800 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right side - Profile & Settings */}
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => navigate('/admin/settings')}
          className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
        >
          <Settings className="w-6 h-6" />
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center p-1.5 pr-3 rounded-full border border-blue-50 hover:bg-blue-50/50 transition-all bg-slate-50/30 group"
          >
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-95 transition-transform">
              {profileImage ? (
                <img src={profileImage} alt="profile" className="h-full w-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
              {displayName}
            </span>
          </button>

          {/* Desktop/Tablet Hover & Click Dropdown */}
          <div 
            className={`absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden transition-all duration-300 origin-top-right transform ${
              isDropdownOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'
            }`}
          >
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">System Admin</p>
              <h3 className="font-bold text-slate-800 line-clamp-1">{displayName}</h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="p-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink 
                  key={item.name}
                  to={item.path} 
                  onClick={() => setIsDropdownOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  {item.name}
                </NavLink>
              ))}
            </div>
            <div className="p-2 border-t border-slate-50 bg-slate-50/30">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all group"
              >
                <LogOut className="w-4 h-4 mr-3 text-rose-400 group-hover:text-rose-500 transition-colors" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopNav;