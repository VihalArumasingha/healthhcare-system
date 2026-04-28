import React, { useState } from 'react';
import { getAuth, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ShieldAlert, Key, Trash2, AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { logout } from '../../auth/services/authService';
import axios from 'axios';

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      setStatus({ type: 'error', message: 'Please enter your password to confirm deletion' });
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Re-authenticate
      await reauthenticateWithCredential(user, credential);

      // 1. Delete from MongoDB via Auth Service
      await axios.delete(`${import.meta.env.VITE_AUTH_API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Delete from Firebase
      await deleteUser(user);
      
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">System Settings</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Manage your administrative security and account</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Password Update Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Security</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update your admin credentials</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm New Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {status.message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <p className="text-sm font-bold">{status.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:shadow-xl hover:shadow-slate-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>

        {/* Account Management (Formerly Danger Zone) */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Account Management</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sensitivity Actions</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 font-bold mb-8 leading-relaxed">
              Deleting this admin account is permanent. All administrative access associated with this terminal will be revoked.
            </p>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:shadow-xl hover:shadow-slate-200 transition-all flex items-center justify-center gap-2 group"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Admin Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="p-5 bg-slate-50 text-slate-500 rounded-full mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Final Confirmation</h3>
              <p className="text-slate-500 font-bold text-sm mb-8">
                To confirm removal, please enter your current password. This action cannot be undone.
              </p>
              
              <div className="w-full space-y-6">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 transition-all font-bold text-slate-700 text-center"
                  placeholder="Enter Password"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setCurrentPassword(''); }}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || !currentPassword}
                    className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Removal"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;