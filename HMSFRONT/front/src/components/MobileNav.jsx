import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Users, Layout, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout as logoutAPI } from '../api';

const MobileNav = ({ isOpen, onClose }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutAPI(); } catch (e) {}
    finally { logoutUser(); navigate('/login'); }
  };

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Team', path: '/teams' },
    { icon: Layout, label: 'Hackathons', path: '/hackathons' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl md:hidden"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="HMS" className="w-8 h-8 object-contain" />
                <span className="text-lg font-bold text-slate-800">HMS</span>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 m-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.username}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Workspace Admin</p>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:bg-slate-50'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
