import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { 
  Search, 
  FileDown, 
  Trash2, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  User,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Save,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const AdminPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error("No admin user logged in");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      
      const response = await axios.get(`${import.meta.env.VITE_PATIENT_API}/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (firebaseId) => {
    if (!window.confirm("Are you sure you want to delete this patient? This will remove their medical records and account access.")) {
      return;
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      
      // Call patient-service to delete medical profile
      await axios.delete(`${import.meta.env.VITE_PATIENT_API}/admin/${firebaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setPatients(prev => prev.filter(p => p.firebaseId !== firebaseId));
      alert("Patient deleted successfully");
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient. Please try again.");
    }
  };

  const handleEditClick = (patient) => {
    setEditingPatient({
      firebaseId: patient.firebaseId,
      name: patient.name || '',
      phone: patient.phone || '',
      address: patient.address || '',
      activeStatus: patient.activeStatus || 'Active',
      email: patient.email // Read-only
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      // 1. Update Profile in Patient Service
      await axios.put(`${import.meta.env.VITE_PATIENT_API}/admin/${editingPatient.firebaseId}`, {
        name: editingPatient.name,
        phone: editingPatient.phone,
        address: editingPatient.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Update Account Status in Auth Service
      await axios.patch(`${import.meta.env.VITE_AUTH_API}/admin/users/${editingPatient.firebaseId}/status`, {
        activeStatus: editingPatient.activeStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setPatients(prev => prev.map(p => 
        p.firebaseId === editingPatient.firebaseId 
          ? { ...p, ...editingPatient } 
          : p
      ));

      setIsEditModalOpen(false);
      alert("User updated successfully");
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Failed to update patient.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    (patient.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (patient.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search and Action Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <FileDown className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Patients Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Patient</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Contact Info</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Joined Date</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-slate-400 font-bold tracking-tight">Fetching patient records...</p>
                    </div>
                  </td>
                </tr>
              ) : currentPatients.length > 0 ? currentPatients.map((patient) => (
        <tr key={patient.firebaseId} className="group hover:bg-blue-50/30 transition-colors">
          <td className="px-8 py-6">
            <div className="flex items-center gap-4">
              {patient.profileImage ? (
                <img 
                  src={patient.profileImage} 
                  alt={patient.name} 
                  className="h-12 w-12 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" 
                />
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                  {(patient.name || 'P').charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-800 tracking-tight">{patient.name || 'Unnamed Patient'}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">ID: {patient.firebaseId?.slice(-6).toUpperCase()}</p>
              </div>
            </div>
          </td>
          <td className="px-8 py-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> {patient.email}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-300" /> {patient.phone || 'No phone'}
              </div>
            </div>
          </td>
          <td className="px-8 py-6 font-bold text-slate-500 text-sm">
            {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
          </td>
          <td className="px-8 py-6">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              (patient.activeStatus || 'Active') === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
              (patient.activeStatus === 'Suspended' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')
            }`}>
              {patient.activeStatus || 'Active'}
            </span>
          </td>
          <td className="px-8 py-6">
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => handleEditClick(patient)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(patient.firebaseId)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      )) : (
        <tr>
          <td colSpan="5" className="px-8 py-20 text-center">
            <p className="text-slate-400 font-bold tracking-tight">No patients found matches your search.</p>
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* Pagination Footer */}
<div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
    Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
  </p>
  <div className="flex items-center gap-2">
    <button 
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
    {[...Array(totalPages)].map((_, i) => (
      <button 
        key={i}
        onClick={() => paginate(i + 1)}
        className={`h-10 w-10 rounded-xl font-bold transition-all ${
          currentPage === i + 1 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        {i + 1}
      </button>
    ))}
    <button 
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
</div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        patient={editingPatient}
        setPatient={setEditingPatient}
        onSave={handleUpdatePatient}
        isUpdating={isUpdating}
      />
    </div>
  );
};

// Edit Modal Component
const EditUserModal = ({ isOpen, onClose, patient, setPatient, onSave, isUpdating }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Edit Profile</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Primary ID)</label>
              <input type="text" disabled value={patient.email} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-400 opacity-70 cursor-not-allowed" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-800">Full Name</label>
              <input 
                type="text" 
                required
                value={patient.name} 
                onChange={(e) => setPatient({...patient, name: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-800">Phone</label>
                <input 
                  type="text" 
                  value={patient.phone} 
                  onChange={(e) => setPatient({...patient, phone: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-800">Account Status</label>
                <select 
                  value={patient.activeStatus}
                  onChange={(e) => setPatient({...patient, activeStatus: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Deleted">Internal Flag (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-800">Home Address</label>
              <textarea 
                rows="3"
                value={patient.address} 
                onChange={(e) => setPatient({...patient, address: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none" 
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-75"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isUpdating ? 'Saving Changes...' : 'Save User Data'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPatients;