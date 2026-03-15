import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Tag, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createHackathonPost, updateHackathonPost } from '../api';

const HackathonModal = ({ onClose, onSuccess, post }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    role: post?.role || '',
    description: post?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.role || !formData.description) {
        setError('Please fill in all fields.');
        return;
    }

    setLoading(true);
    try {
      if (post) {
        await updateHackathonPost(post._id, formData);
      } else {
        await createHackathonPost(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="w-full max-w-2xl bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 shadow-sm">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">{post ? 'Post Updated!' : 'Post Created!'}</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                {post ? 'Your changes have been saved.' : 'Good luck finding your dream team. Your post is now live!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-slate-600 transition-colors z-30 p-2"
        >
          <X size={24} />
        </button>

        <header className="mb-8 md:mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={12} /> {post ? 'Modify Post' : 'New Recruitment'}
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 mb-2 tracking-tight">
            {post ? 'Edit Recruitment' : 'Find Teammates'}
          </h2>
          <p className="text-slate-400 font-medium text-sm md:text-base">
            {post ? 'Update your recruitment details below.' : "Tell the community what you're working on and who you need."}
          </p>
        </header>

        {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-semibold"
            >
                <AlertCircle size={18} />
                {error}
            </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 ml-1">Hackathon Title</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Google AI Hackathon"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-700 font-bold focus:outline-none focus:border-primary-400 focus:bg-white transition-all shadow-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 ml-1">Role Needed</label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-700 font-bold focus:outline-none focus:border-primary-400 focus:bg-white transition-all shadow-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 ml-1">Project Description & Responsibilities</label>
            <textarea
              placeholder="Briefly describe your project idea and what the role entails..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 text-slate-700 font-medium focus:outline-none focus:border-primary-400 focus:bg-white transition-all shadow-sm resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (post ? 'Updating...' : 'Publishing...') : (post ? 'Save Changes' : 'Publish Recruitment')}
            {!loading && <Send size={20} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default HackathonModal;
