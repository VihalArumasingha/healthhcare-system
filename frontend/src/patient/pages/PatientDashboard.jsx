import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToAuthChanges } from '../../auth/services/authService';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowUpRight, 
  TrendingUp, 
  Activity, 
  Droplets,
  Plus,
  Search,
  ChevronRight,
  Video,
  ArrowRight
} from 'lucide-react';

const PatientDashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAuthChanges((data) => {
      setUser(data?.user || null);
    });
    return () => unsub();
  }, []);

  const stats = [
    { label: 'Upcoming Appointments', value: '03', icon: <Calendar className="w-5 h-5" />, color: 'bg-blue-500', trend: '+12.5%' },
    { label: 'Total Consultations', value: '12', icon: <Activity className="w-5 h-5" />, color: 'bg-emerald-500', trend: '+8.2%' },
    { label: 'Medical Records', value: '08', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-purple-500', trend: '+15.3%' },
    { label: 'Lab Reports', value: '05', icon: <Droplets className="w-5 h-5" />, color: 'bg-orange-500', trend: '-2.1%' },
  ];

  const appointments = [
    { doctor: 'Dr. Sarah Wilson', specialty: 'General Physician', time: '10:30 AM', date: 'Tomorrow', image: null },
    { doctor: 'Dr. Michael Chen', specialty: 'Dermatologist', time: '02:00 PM', date: '24 Apr', image: null },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user?.displayName || 'Alex'}! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200">
            <Plus className="w-4 h-4" /> <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Inspired by the reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
              </div>
              <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} w-[60%] opacity-80`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link to="/doctors" className="rounded-[2rem] bg-white p-7 shadow-sm border border-slate-100 hover:border-teal-200 transition-colors group">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-teal-700">
            <Video className="w-3.5 h-3.5" /> Telemedicine ready
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">Prepare for a video consultation.</h2>
          <p className="mt-2 text-sm text-slate-500 leading-6">
            Find a doctor, book a slot, and your care team can move the visit to telemedicine when needed.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-teal-600 font-bold text-sm">
            Find a doctor <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">Recent Appointments</h2>
            <button className="text-teal-600 text-xs font-black uppercase tracking-widest hover:text-teal-700">View All</button>
          </div>
          <div className="p-4">
            {appointments.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-3xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                    {app.doctor.split(' ')[1].charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{app.doctor}</h4>
                    <p className="text-xs text-slate-500 font-medium">{app.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm justify-end">
                      <Clock className="w-3.5 h-3.5 text-teal-500" /> {app.time}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{app.date}</div>
                  </div>
                  <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-white group-hover:text-teal-600 group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Health Snapshot */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black italic tracking-tighter">Activity Feed</h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-bold">LIVE</span>
          </div>
          <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            <ActivityItem 
              title="Profile Updated" 
              time="2 hours ago" 
              desc="You updated your blood group to AB+" 
              completed 
            />
            <ActivityItem 
              title="Lab Result Posted" 
              time="Yesterday" 
              desc="Annual Blood Report is ready for review" 
            />
            <ActivityItem 
              title="Appointment Paid" 
              time="3 days ago" 
              desc="Payment for Dr. Wilson confirmed" 
              completed
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ title, time, desc, completed }) => (
  <div className="relative pl-10">
    <div className={`absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center border-4 border-slate-900 z-10 ${completed ? 'bg-teal-500' : 'bg-slate-700'}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
    </div>
    <div>
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-sm font-black text-slate-100 tracking-tight">{title}</h4>
        <span className="text-[10px] font-bold text-slate-500">{time}</span>
      </div>
      <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default PatientDashboard;