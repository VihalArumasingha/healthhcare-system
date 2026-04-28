import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { subscribeToAuthChanges } from '../../auth/services/authService';
import { Pill, Clock, AlertCircle, Search } from 'lucide-react';

const Prescriptions = () => {
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (data) => {
      if (data?.user) {
        setUser(data.user);
        const token = await data.user.getIdToken();
        await fetchPrescriptions(token);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchPrescriptions = async (token) => {
    try {
      // Future integration with patient/prescription endpoints
      setPrescriptions([]); 
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.medicationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 hidden md:block">
              <Pill className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">My Prescriptions</h1>
              <p className="text-teal-50 font-medium mt-1">Review and manage your current active medications.</p>
            </div>
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
              placeholder="Search medications or doctors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-12 py-4 focus:border-teal-500 focus:bg-white outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>

          {prescriptions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-teal-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-teal-100">
                <Pill className="w-10 h-10 text-teal-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Prescriptions</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                You do not have any active prescriptions prescribed by your doctor.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((prescription, idx) => (
                <div key={idx} className="group relative border border-slate-100 bg-slate-50 hover:bg-white flex items-center p-5 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-100">
                  {/* Prescriptions List here */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;