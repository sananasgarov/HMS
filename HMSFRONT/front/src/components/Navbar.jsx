import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Masanı Seç', icon: LayoutDashboard },
    { path: '/teams', label: 'Komandalar', icon: Users },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-center pointer-events-none">
      <div className="glass-morphism px-8 py-4 rounded-full border border-white/10 flex items-center gap-12 pointer-events-auto shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-black text-white">H</div>
          <span className="text-white font-bold tracking-tight hidden md:block">HMS</span>
        </div>

        <div className="h-6 w-px bg-white/10"></div>

        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all text-sm font-semibold ${
                location.pathname === item.path 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="h-6 w-px bg-white/10"></div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-white text-xs font-bold leading-none">{user.username}</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-black leading-none mt-1">İstifadəçi</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary-400">
              <User size={20} />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300 transition-colors p-2"
            title="Çıxış"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
