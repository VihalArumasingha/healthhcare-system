import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar, 
  ExternalLink, 
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  Stethoscope,
  Phone,
  Mail,
  Filter,
  Loader2
} from 'lucide-react';

const VerifyDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      
      const [resPending, resApproved] = await Promise.all([
        axios.get(`${import.meta.env.VITE_AUTH_API}/admin/doctors/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_AUTH_API}/users/count?role=doctor&status=approved`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { count: 0 } }))
      ]);
      
      setPendingDoctors(resPending.data);
      setApprovedCount(resApproved.data.count || 0);
    } catch (error) {
      console.error("Error fetching verification data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleVerify = async (firebaseId) => {
    if (!window.confirm("Are you sure you want to approve this doctor?")) return;
    try {
      const token = await getAuth().currentUser.getIdToken();
      await axios.patch(`${import.meta.env.VITE_AUTH_API}/admin/doctors/${firebaseId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingDoctors(prev => prev.filter(doc => doc.firebaseId !== firebaseId));
      alert("Doctor has been successfully approved.");
    } catch (error) {
      console.error("Error verifying doctor:", error);
      alert("Verification failed. Please try again.");
    }
  };

  const handleReject = async (firebaseId) => {
    if (!window.confirm("Are you sure you want to reject this doctor application?")) return;
    try {
      const token = await getAuth().currentUser.getIdToken();
      await axios.patch(`${import.meta.env.VITE_AUTH_API}/admin/doctors/${firebaseId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingDoctors(prev => prev.filter(doc => doc.firebaseId !== firebaseId));
      alert("Doctor application has been rejected.");
    } catch (error) {
      console.error("Error rejecting doctor:", error);
      alert("Rejection failed. Please try again.");
    }
  };

  const filteredDoctors = pendingDoctors.filter(doc => 
    (doc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (doc.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Doctor Verifications</h1>
          <p className="text-slate-500 font-medium">Review and approve new doctor applications to the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Pending Review</span>
            <div className="p-2 rounded-xl bg-blue-500 text-white">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-800">{pendingDoctors.length}</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-blue-500 font-bold">Awaiting Action</span>
              </div>
            </div>
            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[100%] opacity-80"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Approved</span>
            <div className="p-2 rounded-xl bg-emerald-500 text-white">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-800">{approvedCount}</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-emerald-500 font-bold">Verified Doctors</span>
              </div>
            </div>
            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[100%] opacity-80"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Flagged Cases</span>
            <div className="p-2 rounded-xl bg-rose-500 text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-800">0</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-slate-400 font-bold">Standard security</span>
              </div>
            </div>
            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-[0%] opacity-80"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>{/*Table header*/}
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Doctor Information</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Phone Number</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-slate-400 font-bold tracking-tight">Fetching applications...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
                <tr key={doc.firebaseId || doc._id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg uppercase">
                        {doc.name ? doc.name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{doc.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                            <Mail className="w-3 h-3" /> {doc.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1.5">
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">{doc.phoneNumber || 'No phone provided'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleVerify(doc.firebaseId)}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(doc.firebaseId)}
                        className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                        title="Reject Application"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <ShieldAlert className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold tracking-tight">No pending applications found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerifyDoctors;