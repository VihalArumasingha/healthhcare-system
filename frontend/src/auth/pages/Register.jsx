import React, { useState } from 'react';
import { register, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, UserPlus } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phoneNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email, password, name, role, phoneNumber, address } = formData;
      await register(email, password, name, role, { phoneNumber, address });

      
      // Redirect based on role
      if (role === 'doctor') {
        toast.success('Registration successful! Welcome to your dashboard.');
        navigate('/doctor-dashboard/profile');
      } else {
        // LOG OUT immediately after registration for patients to prevent auto-login
        // This ensures they must go through the Login page to establish a fresh session with roles/claims
        await logout();
        toast.success('Registration successful! Please sign in.');
        navigate('/login');
      }
      
    } catch (error) {
      toast.error(error.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Colors for Visibility */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-100 -z-10"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200 rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200 rounded-full blur-[100px] opacity-40"></div>
      
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-full max-w-lg mt-12 mb-12 relative z-10">
        {/* Minimal Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-200 mb-4 text-slate-900 font-bold text-xl">
              H
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Create an Account
          </h1>
          <p className="text-slate-600 font-semibold">
            Join the HealthEase community
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Vertical Layout: All fields one after another */}
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" name="name" 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    placeholder="John Doe" required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" name="email" 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    placeholder="name@gmail.com" required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" name="password" 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    placeholder="••••••••" required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    name="role" value={formData.role} 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" name="phoneNumber" 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    placeholder="+1 (555) 000-0000" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" name="address" 
                    onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-8"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Register Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-slate-500 font-bold text-sm">
          Already have an account? 
          <Link to="/login" className="ml-1 text-slate-900 hover:underline decoration-2 underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
