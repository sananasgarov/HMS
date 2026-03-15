import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as logoutAPI } from '../api';
import { 
  LayoutGrid, 
  Users, 
  LogOut, 
  Layout
} from 'lucide-react';

const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAPI(); // Call backend to clear cookie
    } catch (e) {
      // silently fail if backend is unreachable
    } finally {
      logoutUser(); // Always clear local state
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Team', path: '/teams' },
    { icon: Layout, label: 'Hackathons', path: '/hackathons' },
  ];

  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <img src="/logo.png" alt="HMS Logo" className="w-10 h-10 object-contain" />
        <span className="text-xl font-bold tracking-tight text-slate-800">HMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        <div className="pt-4 mt-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3 px-2 py-4 border-t border-slate-50">
          <img 
            src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} 
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-bold text-slate-800 truncate">{user.username}</h5>
            <p className="text-[10px] text-slate-400 font-medium truncate">Workspace Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
