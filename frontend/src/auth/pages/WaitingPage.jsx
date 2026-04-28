import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { logout } from '../services/authService';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const WaitingPage = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [autoCheckCount, setAutoCheckCount] = useState(0);
  const AUTH_API = import.meta.env.VITE_AUTH_API;

  // Auto-check for approval every 10 seconds (up to 5 times = 50 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (autoCheckCount < 5) {
        await handleRefreshStatus();
        setAutoCheckCount(prev => prev + 1);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [autoCheckCount]);

  const handleRefreshStatus = async () => {
    try {
      setIsRefreshing(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        // 1. Refresh Firebase token
        await user.getIdToken(true);
        
        // 2. Check approval status from database
        const token = await user.getIdToken();
        const response = await axios.get(`${AUTH_API}/verify-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.isApproved) {
          // Doctor has been approved! Refresh token claims and redirect
          const updatedTokenResult = await user.getIdTokenResult(true);
          setMessage('✓ Account approved! Redirecting...');
          setTimeout(() => {
            navigate('/doctor-dashboard/profile');
          }, 1000);
        } else {
          setMessage('Status: Still pending approval. Checking again soon...');
        }
      }
    } catch (err) {
      console.error("Refresh error:", err);
      setMessage('Checking status...');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-50 rounded-full animate-pulse border border-amber-100">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Under Review</h1>
        <p className="text-slate-600 mb-8">
          Thank you for joining HealthEase! Our administrative team is currently verifying your medical credentials. This typically takes 24-48 hours.
        </p>

        <div className="space-y-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Registration Received</p>
              <p className="text-xs text-slate-500">Your profile has been created successfully.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Verification Pending</p>
              <p className="text-xs text-slate-500">Admin is reviewing your uploaded documents.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 mb-8">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-800 text-left">
            We'll send an email to your registered address once your account is active.
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 text-xs text-green-800 text-center">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Refresh Status'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-slate-200"
          >
            <LogOut className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
