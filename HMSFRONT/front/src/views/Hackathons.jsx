import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Sparkles, Loader2, User, Clock, Briefcase, Layout, Pencil, Trash2 } from 'lucide-react';
import { getHackathonPosts, deleteHackathonPost } from '../api';
import { formatDistanceToNow } from 'date-fns';
import HackathonModal from '../components/HackathonModal';
import { useAuth } from '../context/AuthContext';

const Hackathons = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await getHackathonPosts();
      setPosts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching hackathon posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteHackathonPost(id);
      fetchPosts();
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafc] flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="p-6 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                <Flame className="text-white" size={32} />
            </div>
            Hackathons Community
          </h1>
          <p className="text-slate-400 font-medium text-sm md:text-base mt-2">Connecting talent with amazing hackathon opportunities.</p>
        </div>
        
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-black px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl transition-all shadow-xl shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-3 text-sm md:text-base whitespace-nowrap"
        >
            <Plus size={20} />
            Create Recruitment Post
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 scrollbar-hide">
        {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary-500" size={48} />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Syncing community board...</p>
            </div>
        ) : posts.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-12 md:p-24 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                    <Layout size={48} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">The board is quiet...</h3>
                <p className="text-slate-400 max-w-sm mx-auto mb-10 font-medium leading-relaxed">No recruitment posts yet. Be the first to start a team for an upcoming hackathon!</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-8 py-4 rounded-2xl transition-all border border-slate-100"
                >
                  Post First Recruitment
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                <AnimatePresence mode='popLayout'>
                    {posts.map((post, idx) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] card-shadow border border-slate-50 group hover:border-primary-200 transition-all hover:-translate-y-2 flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <Sparkles size={80} className="text-primary-600" />
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${post.username}&background=random`} 
                                        alt={post.username}
                                        className="w-full h-full"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-base md:text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{post.title}</h4>
                                    <div className="flex items-center gap-3 text-[10px] md:text-xs text-slate-400 font-bold">
                                        <span className="flex items-center gap-1"><User size={12} /> {post.username}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(post.createdAt))} ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border border-emerald-100 mb-4">
                                    <Briefcase size={14} /> Looking for: {post.role}
                                </div>
                                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium line-clamp-4">
                                    {post.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {post.username === user.username && (
                                        <>
                                            <button 
                                                onClick={() => handleEdit(post)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-100 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(post._id)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                                <a 
                                    href={`mailto:${post.email}?subject=Regarding your hackathon post: ${post.title}`}
                                    className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-2"
                                >
                                    Send Message →
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <HackathonModal 
            post={editingPost}
            onClose={() => {
                setIsModalOpen(false);
                setEditingPost(null);
            }}
            onSuccess={() => {
                setIsModalOpen(false);
                setEditingPost(null);
                fetchPosts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hackathons;
