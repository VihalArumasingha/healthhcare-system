import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { subscribeToAuthChanges } from '../../auth/services/authService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  UserCog, 
  Calendar, 
  Activity, 
  TrendingUp, 
  FileText,
  Search,
  Plus,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    pendingDoctors: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState([
    { name: 'Mon', revenue: 0, transactions: 0 },
    { name: 'Tue', revenue: 0, transactions: 0 },
    { name: 'Wed', revenue: 0, transactions: 0 },
    { name: 'Thu', revenue: 0, transactions: 0 },
    { name: 'Fri', revenue: 0, transactions: 0 },
    { name: 'Sat', revenue: 0, transactions: 0 },
    { name: 'Sun', revenue: 0, transactions: 0 },
  ]);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    const unsub = subscribeToAuthChanges((data) => {
      setUser(data?.user || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        // Fetch stats and recent users
        const [resPatients, resDoctors, resPending, resAppointments, resUsers] = await Promise.all([
          axios.get(`${import.meta.env.VITE_AUTH_API}/users/count?role=patient`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_AUTH_API}/users/count?role=doctor`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_AUTH_API}/users/count?role=doctor&activeStatus=Pending`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_APPOINTMENT_API}/count`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_AUTH_API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setCounts({
          patients: resPatients.data.count || 0,
          doctors: (resDoctors.data.count || 0) - (resPending.data.count || 0),
          appointments: resAppointments.data.count || 0,
          pendingDoctors: resPending.data.count || 0
        });

        // Financial data will use default values since payment service isn't running

        // Get latest 4 users
        if (Array.isArray(resUsers.data)) {
          const sorted = [...resUsers.data]
            .filter(u => u.role !== 'admin')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);
          setRecentUsers(sorted);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  const stats = [
    { label: 'Total Patients', value: counts.patients.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'bg-blue-500', trend: 'Live Data' },
    { label: 'Active Doctors', value: counts.doctors.toLocaleString(), icon: <UserCog className="w-5 h-5" />, color: 'bg-emerald-500', trend: 'Verified' },
    { label: 'Pending Verifications', value: counts.pendingDoctors.toString(), icon: <Clock className="w-5 h-5" />, color: 'bg-amber-500', trend: 'Needs Review' },
    { label: 'Total Appointments', value: counts.appointments.toLocaleString(), icon: <Calendar className="w-5 h-5" />, color: 'bg-purple-500', trend: 'All Time' },
  ];

  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Admin Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Oversee platform operations and financial transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users, IDs..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 shadow-xs"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">
            <ShieldCheck className="w-4 h-4" /> <span>Manage Access</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}-100 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Organic</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Financial Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Financial Overview</h2>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Weekly Revenue Analysis (Live)</p>
          </div>
          <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="text-right px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Profit</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">{formatCurrency(totalProfit)}</p>
               </div>
               <div className="h-8 w-px bg-slate-200"></div>
               <button className="p-3 bg-white text-blue-600 rounded-xl shadow-xs border border-slate-100 hover:bg-blue-600 hover:text-white transition-all">
                  <FileText className="w-5 h-5" />
               </button>
            </div>
          </div>
          
          <div className="p-10 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 10}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 10}}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Registrations - SIDEBAR */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Plus className="w-32 h-32" />
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">Recent Registrations</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Latest verified accounts</p>
                </div>
                <Users className="w-6 h-6 text-blue-500" />
              </div>

              <div className="space-y-6">
                {recentUsers.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-xs font-bold uppercase tracking-widest">No recent activity</p>
                  </div>
                ) : (
                  recentUsers.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-3xl hover:bg-slate-800/80 transition-all border border-slate-800 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-xs
                          ${item.role === 'doctor' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {item.name?.substring(0, 1) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-100 tracking-tight truncate w-32">{item.name}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full
                            ${item.role === 'doctor' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {item.role}
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-slate-600 uppercase">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button className="w-full mt-10 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                Expand Full History
              </button>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl shadow-blue-100">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Status</p>
                <h3 className="text-xl font-black tracking-tighter">All Nodes Active</h3>
             </div>
             <div className="h-12 w-12 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 group">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;