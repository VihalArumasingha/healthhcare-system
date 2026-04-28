import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { user, role } = await login(email, password);
            toast.success('Login successful!');
            
            if (role === 'doctor') {
                const tokenResult = await user.getIdTokenResult();
                if (!tokenResult.claims.isVerified) {
                    navigate('/waiting');
                } else {
                    navigate('/doctor-dashboard/profile');
                }
            } else if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/patient/dashboard');
            }
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Very obvious background colors to test visibility */}
            <div className="absolute top-0 left-0 w-full h-full bg-slate-100 -z-10"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200 rounded-full blur-[100px] opacity-40"></div>
            
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="w-full max-w-md relative z-10">
                {/* Minimal Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-200 mb-4 text-slate-900 font-bold text-xl">
                        H
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-600 font-semibold">
                        Access your health dashboard
                    </p>
                </div>

                {/* Changed bg-white/80 backdrop-blur-xl to bg-white for visibility test */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="email" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="password" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-bold text-sm">
                        New to HealthEase? 
                        <Link to="/register" className="ml-1 text-slate-900 hover:underline decoration-2 underline-offset-4">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
