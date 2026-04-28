import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { subscribeToAuthChanges } from '../../auth/services/authService';
import { toast } from 'react-toastify';
import { FileText, Download, UploadCloud, Trash2, Calendar, File, Search } from 'lucide-react';

const MedicalRecords = () => {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (data) => {
      if (data?.user) {
        setUser(data.user);
        const token = await data.user.getIdToken();
        await fetchRecords(token);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchRecords = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_PATIENT_API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.medicalReports) {
        setRecords(response.data.medicalReports);
      }
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => 
    record.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('report', file); // changed from document to report

    setUploading(true);
    const loader = toast.loading("Uploading medical record...");

    try {
      const token = await user.getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_PATIENT_API}/profile/reports`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      setRecords(response.data.medicalReports || []);
      toast.update(loader, { render: "Record uploaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error("Upload Error:", error);
      toast.update(loader, { render: "Failed to upload document.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (identifier) => {
    try {
      const token = await user.getIdToken();
      // Ensure the identifier (ID or URL) is safely encoded for the API route
      const safeId = encodeURIComponent(identifier);
      const response = await axios.delete(`${import.meta.env.VITE_PATIENT_API}/profile/reports/${safeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data.medicalReports || []);
      toast.success("Record deleted successfully.");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete record.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 pt-12 pb-24 px-6 md:px-12 rounded-b-[3rem] shadow-sm relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Medical Records</h1>
              <p className="text-teal-50 font-medium mt-1">Manage and access your health reports securely.</p>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 relative group">
            <input 
              type="file" 
              id="file-upload" 
              onChange={handleFileUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <button className="flex items-center bg-white text-teal-600 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-700/20 group-hover:bg-teal-50 transition-all z-10 relative">
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mr-2"></div>
              ) : (
                <UploadCloud className="w-5 h-5 mr-2" />
              )}
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
          
          {/* Search Bar inside Page */}
          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Search by filename..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-12 py-4 focus:border-teal-500 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>

          {records.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-teal-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-teal-100">
                <File className="w-10 h-10 text-teal-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Records Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                You haven't uploaded any medical records yet. Upload prescriptions, lab results, or imaging reports to keep them handy.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <div key={record._id || record.fileUrl} className="group relative border border-slate-100 bg-slate-50 hover:bg-white flex items-center p-5 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-100">
                    <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 shrink-0 mr-4 group-hover:bg-teal-50">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-slate-800 truncate mb-1" title={record.fileName}>
                        {record.fileName}
                      </p>
                      <div className="flex items-center text-xs font-semibold text-slate-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(record.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button 
                        onClick={() => window.open(record.fileUrl, '_blank', 'noreferrer')}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="View Document"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(record._id || record.fileUrl)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold">
                  No records matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;