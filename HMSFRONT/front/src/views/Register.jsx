import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { register } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Layout, User, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await register(formData);
      loginUser(response.data.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-50 rounded-full -ml-64 -mt-64 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full -mr-64 -mb-64 blur-3xl opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white p-12 rounded-[3.5rem] card-shadow border border-slate-100 relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <img src="/logo.png" alt="HMS" className="w-14 h-14 object-contain mb-8" />
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Join HMS</h1>
          <p className="text-slate-400 font-medium mt-3">Create your workspace account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-medium"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-13 pr-4 py-4.5 text-slate-700 font-medium focus:outline-none focus:border-primary-400 focus:bg-white transition-all shadow-sm"
                placeholder="sanan_asgarov"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-13 pr-4 py-4.5 text-slate-700 font-medium focus:outline-none focus:border-primary-400 focus:bg-white transition-all shadow-sm"
                placeholder="senan@hbtn.io"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-13 pr-4 py-4.5 text-slate-700 font-medium focus:outline-none focus:border-primary-400 focus:bg-white transition-all shadow-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started Now'}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-slate-50 pt-8">
           <p className="text-slate-400 text-sm font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
