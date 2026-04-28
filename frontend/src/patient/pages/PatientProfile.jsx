import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { subscribeToAuthChanges } from '../../auth/services/authService';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Droplets, Calendar, Mail, Save, Edit3, UserCheck, HeartPulse, AlertTriangle, FileText, Contact, Plus, Trash2 } from 'lucide-react';

const PatientProfile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'Prefer Not To Say',
    dateOfBirth: '',
    bloodGroup: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    allergies: [],
    medicalHistory: []
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (data) => {
      if (data?.user) {
        setUser(data.user);
        const token = await data.user.getIdToken();
        setProfile(prev => {
          const newProf = {
            ...prev,
            name: data.user.displayName || '',
            email: data.user.email || ''
          };
          setOriginalProfile(newProf);
          return newProf;
        });
        await fetchProfile(data.user.uid, token);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchProfile = async (uid, token) => {
    try {
      console.log("Fetching profile for UID:", uid);
      // 1. Fetch Medical info
      const resMedical = await axios.get(`${import.meta.env.VITE_PATIENT_API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. Fetch Basic info
      const resAuth = await axios.get(`${import.meta.env.VITE_AUTH_API}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Profile API Raw Data:", { medical: resMedical.data, auth: resAuth.data });

      setProfile(prev => {
        const medicalData = resMedical.data || {};
        const authData = resAuth.data || {};
        
        const fetchedProfile = {
          ...prev,
          ...medicalData,
          name: authData.name || medicalData.name || prev.name,
          email: authData.email || medicalData.email || prev.email,
          phone: authData.phoneNumber || authData.phone || medicalData.phone || prev.phone || '',
          address: authData.address || medicalData.address || prev.address || '',
          dateOfBirth: medicalData.dateOfBirth ? medicalData.dateOfBirth.split('T')[0] : prev.dateOfBirth,
          emergencyContact: medicalData.emergencyContact || { name: '', relationship: '', phone: '' },
          allergies: medicalData.allergies || [],
          medicalHistory: medicalData.medicalHistory || []
        };
        
        console.log("Final Merged Profile State:", fetchedProfile);
        setOriginalProfile(fetchedProfile);
        return fetchedProfile;
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      // If medical profile is 404, still load the auth data if possible
      if (error.response?.status === 404) {
        try {
          const resAuth = await axios.get(`${import.meta.env.VITE_AUTH_API}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfile(prev => ({
            ...prev,
            name: resAuth.data.name || prev.name,
            email: resAuth.data.email || prev.email,
            phone: resAuth.data.phoneNumber || resAuth.data.phone || prev.phone,
            address: resAuth.data.address || prev.address
          }));
        } catch (authErr) {
          console.error("Error fetching auth data:", authErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("Updating profile for UID:", user?.uid);
    console.log("Payload:", profile);
    try {
      if (!user) {
        toast.error("User not authenticated.");
        return;
      }
      const token = await user.getIdToken();
      
      const payload = {
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup || 'Unknown',
        allergies: profile.allergies,
        medicalHistory: profile.medicalHistory,
        emergencyContact: profile.emergencyContact
      };

      console.log("Sending payload:", payload);

      const response = await axios.put(`${import.meta.env.VITE_PATIENT_API}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Basic Info (Name, Phone, Address) in auth-service
      await axios.put(`${import.meta.env.VITE_AUTH_API}/profile`, {
        name: profile.name,
        phoneNumber: profile.phone,
        address: profile.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Update response:", response.data);
      setOriginalProfile({ ...profile, ...response.data });
      setProfile({ ...profile, ...response.data });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error("Update Error:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        // If profile doesn't exist, we might need to create it
        handleInitialCreate();
      }
    }
  };

  const handleInitialCreate = async () => {
    try {
      const token = await user.getIdToken();
      const payload = {
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup || 'Unknown',
        allergies: profile.allergies,
        medicalHistory: profile.medicalHistory,
        emergencyContact: profile.emergencyContact
      };
      
      const response = await axios.post(`${import.meta.env.VITE_PATIENT_API}/profile/create`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOriginalProfile({ ...profile, ...response.data });
      setProfile({ ...profile, ...response.data });
      toast.success("Profile created successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to create profile.");
      console.error("Create Error:", error.response?.data || error.message);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile({ ...profile, allergies: [...profile.allergies, newAllergy.trim()] });
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergyToRemove) => {
    setProfile({ ...profile, allergies: profile.allergies.filter(a => a !== allergyToRemove) });
  };

  const addMedicalHistory = () => {
    setProfile({ 
      ...profile, 
      medicalHistory: [...profile.medicalHistory, { condition: '', diagnosedDate: '', status: 'Active', notes: '' }] 
    });
  };

  const updateMedicalHistory = (index, field, value) => {
    const newHistory = [...profile.medicalHistory];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setProfile({ ...profile, medicalHistory: newHistory });
  };

  const removeMedicalHistory = (index) => {
    const newHistory = [...profile.medicalHistory];
    newHistory.splice(index, 1);
    setProfile({ ...profile, medicalHistory: newHistory });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const loader = toast.loading("Uploading profile picture...");

    try {
      const token = await user.getIdToken();
      const response = await axios.post(`${import.meta.env.VITE_PATIENT_API}/profile/image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile({ ...profile, profileImage: response.data.imageUrl });
      setOriginalProfile({ ...originalProfile, profileImage: response.data.imageUrl });
      toast.update(loader, { render: "Profile picture updated!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error("Image upload error:", error);
      toast.update(loader, { render: "Failed to upload picture.", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  if (loading) return <div className="p-12 text-center text-teal-600 font-medium animate-pulse">Initializing your profile details...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Profile Section */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative h-32 w-32 rounded-3xl bg-slate-50 border-4 border-white shadow-md flex items-center justify-center text-4xl overflow-hidden group">
              {profile.profileImage || user?.photoURL ? (
                <img src={profile.profileImage || user.photoURL} alt="Avatar" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <span className="text-teal-600 font-black">{profile.name?.charAt(0) || 'P'}</span>
              )}
              {isEditing && (
                <>
                  <div className="absolute bottom-2 right-2 bg-teal-500 rounded-full p-1.5 shadow-lg z-10 pointer-events-none group-hover:hidden">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <label className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white text-sm font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm z-20">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">{profile.name || "Patient Profile"}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-slate-400 font-medium">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => {
                if (isEditing) {
                  console.log("Cancelling edit, restoring:", originalProfile);
                  setProfile({...originalProfile});
                  setNewAllergy('');
                }
                setIsEditing(!isEditing);
              }}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                isEditing 
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                  : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button 
                type="button"
                onClick={handleUpdate}
                className="bg-teal-600 text-white px-8 py-3 rounded-2xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-100 transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Information Boxes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 focus:border-teal-500 focus:bg-white outline-none disabled:opacity-75 transition-all font-semibold text-slate-700"
                    value={profile.name || ''} onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Gender</label>
                  <select 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 focus:border-teal-500 focus:bg-white outline-none disabled:opacity-75 transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                    value={profile.gender || 'Prefer Not To Say'} onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  >
                    {['Male', 'Female', 'Other', 'Prefer Not To Say'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Birth Date</label>
                  <input 
                    type="date" disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 focus:border-teal-500 focus:bg-white outline-none disabled:opacity-75 transition-all font-semibold text-slate-700"
                    value={profile.dateOfBirth ? (profile.dateOfBirth.includes('T') ? profile.dateOfBirth.split('T')[0] : profile.dateOfBirth) : ''} 
                    onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Phone Number</label>
                  <input 
                    type="text" disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 focus:border-teal-500 focus:bg-white outline-none disabled:opacity-75 transition-all font-semibold text-slate-700"
                    value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Address</label>
                  <textarea 
                    rows="2" disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 focus:border-teal-500 focus:bg-white outline-none disabled:opacity-75 transition-all font-semibold text-slate-700 resize-none"
                    value={profile.address || ''} onChange={(e) => setProfile({...profile, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-slate-800">Medical History</h3>
                {isEditing && (
                  <button type="button" onClick={addMedicalHistory} className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:text-teal-700">
                    <Plus className="w-4 h-4" /> Add Record
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {profile.medicalHistory.map((history, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-50 relative group">
                    {isEditing && (
                      <button type="button" onClick={() => removeMedicalHistory(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Condition</label>
                        <input 
                          type="text" disabled={!isEditing}
                          className="w-full bg-white rounded-xl px-4 py-2 text-sm font-bold text-slate-700 border-2 border-transparent focus:border-teal-500 outline-none"
                          value={history.condition} onChange={(e) => updateMedicalHistory(idx, 'condition', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Status</label>
                        <select 
                          disabled={!isEditing}
                          className="w-full bg-white rounded-xl px-4 py-2 text-sm font-bold text-slate-700 border-2 border-transparent focus:border-teal-500 outline-none"
                          value={history.status} onChange={(e) => updateMedicalHistory(idx, 'status', e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                {!profile.medicalHistory.length && (
                  <p className="text-center py-8 text-slate-400 font-medium italic">No medical records shown.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Health Vitals & Contact */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6">Health Vitals</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-1">Blood Type</label>
                  <select 
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3.5 focus:border-teal-500 focus:bg-white outline-none disabled:opacity-75 transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                    value={profile.bloodGroup || ''} onChange={(e) => setProfile({...profile, bloodGroup: e.target.value})}
                  >
                    <option value="">N/A</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <option key={group} value={group}>{group}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-400 ml-1 text-slate-800">Allergies</label>
                    <p className="text-[10px] text-slate-400 ml-1 italic">Add foods, medicines, or seasonal allergies</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy, idx) => (
                      <div key={idx} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-teal-100/50">
                        {allergy}
                        {isEditing && (
                          <button type="button" onClick={() => removeAllergy(allergy)} className="hover:text-teal-900 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="relative group">
                        <input 
                          type="text" 
                          className="bg-slate-50 px-3 py-1.5 rounded-xl text-xs outline-none focus:bg-white border-2 border-dashed border-slate-200 focus:border-teal-500 w-32 transition-all"
                          placeholder="Type & Enter..."
                          value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                        />
                        {newAllergy && (
                          <div className="absolute -top-8 left-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-bounce">
                            Press Enter ⏎
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!isEditing && profile.allergies.length === 0 && (
                    <p className="text-xs text-slate-400 italic ml-1">No allergies recorded</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6">Emergency Contact</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Name</label>
                  <input 
                    type="text" disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-all font-semibold text-slate-700"
                    placeholder="Emergency Contact Name"
                    value={profile.emergencyContact?.name || ''} 
                    onChange={(e) => setProfile({...profile, emergencyContact: {...profile.emergencyContact, name: e.target.value}})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Relation</label>
                  <input 
                    type="text" disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-all font-semibold text-slate-700"
                    placeholder="e.g. Spouse, Parent"
                    value={profile.emergencyContact?.relationship || ''} 
                    onChange={(e) => setProfile({...profile, emergencyContact: {...profile.emergencyContact, relationship: e.target.value}})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Phone</label>
                  <input 
                    type="text" disabled={!isEditing}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 transition-all font-semibold text-slate-700"
                    placeholder="+94 XX XXX XXXX"
                    value={profile.emergencyContact?.phone || ''} 
                    onChange={(e) => setProfile({...profile, emergencyContact: {...profile.emergencyContact, phone: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;