import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { 
  Search, 
  Trash2, 
  Edit, 
  Mail, 
  Phone, 
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  Hospital,
  MapPin
} from 'lucide-react';

const AdminDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_AUTH_API}/admin/doctors/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleEditClick = (doc) => {
    setEditingDoctor({
      firebaseId: doc.firebaseId,
      name: doc.name || '',
      phoneNumber: doc.phoneNumber || '',
      address: doc.address || '',
      status: doc.status || 'approved',
      activeStatus: doc.activeStatus || 'Active', // Added activeStatus
      email: doc.email
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      
      // 1. Update Profile/Verification Status
      await axios.patch(`${import.meta.env.VITE_AUTH_API}/admin/doctors/${editingDoctor.firebaseId}/update`, {
        name: editingDoctor.name,
        phoneNumber: editingDoctor.phoneNumber,
        address: editingDoctor.address,
        status: editingDoctor.status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Update Global activeStatus
      await axios.patch(`${import.meta.env.VITE_AUTH_API}/admin/users/${editingDoctor.firebaseId}/status`, {
        activeStatus: editingDoctor.activeStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDoctors(prev => prev.map(d => 
        d.firebaseId === editingDoctor.firebaseId ? { ...d, ...editingDoctor } : d
      ));

      setIsEditModalOpen(false);
      alert("Doctor updated successfully");
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert("Failed to update doctor.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    (doc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (doc.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const indexOfLastDoc = currentPage * doctorsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - doctorsPerPage;
  const currentDocs = filteredDoctors.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Doctors</h1>
          <p className="text-slate-500 font-medium">View and update doctor account status and details.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search doctors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Doctor Info</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Contact</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading doctors...</p>
                  </td>
                </tr>
              ) : currentDocs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold">No doctors found matching "{searchTerm}"</p>
                  </td>
                </tr>
              ) : (
                currentDocs.map((doc) => (
                  <tr key={doc.firebaseId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg border border-emerald-50 shadow-sm">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{doc.name}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Mail className="w-3 h-3" /> {doc.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                          <Phone className="w-3.5 h-3.5 text-blue-500" /> {doc.phoneNumber || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate max-w-[200px]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {doc.address || 'No address'}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          doc.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                          doc.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {doc.status === 'approved' ? <ShieldCheck className="w-3 h-3" /> : null}
                          {doc.status}
                        </span>
                        
                        {doc.activeStatus && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            doc.activeStatus === 'Active' ? 'bg-blue-100 text-blue-600' : 
                            doc.activeStatus === 'Suspended' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {doc.activeStatus === 'Active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {doc.activeStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(doc)}
                          className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              Showing {indexOfFirstDoc + 1} to {Math.min(indexOfLastDoc, filteredDoctors.length)} of {filteredDoctors.length} doctors
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all shadow-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-xs font-black transition-all shadow-xs ${
                    currentPage === i + 1 ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all shadow-xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Edit Doctor</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Security & Status</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={editingDoctor.name}
                    onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Read-only)</label>
                  <input type="text" value={editingDoctor.email} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                  <select 
                    value={editingDoctor.status}
                    onChange={(e) => setEditingDoctor({...editingDoctor, status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal Access Status</label>
                  <select 
                    value={editingDoctor.activeStatus}
                    onChange={(e) => setEditingDoctor({...editingDoctor, activeStatus: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="Active">Active (Allowed)</option>
                    <option value="Suspended">Suspended (Blocked)</option>
                    <option value="Deleted">Deleted (Blocked)</option>
                  </select>
                  <p className="text-[9px] text-slate-400 font-medium px-1">Global flag to block/allow login across all apps.</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 px-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-4 px-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
