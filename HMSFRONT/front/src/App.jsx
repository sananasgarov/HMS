import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './views/Dashboard';
import TableView from './views/TableView';
import Login from './views/Login';
import Register from './views/Register';
import Teams from './views/Teams';
import Hackathons from './views/Hackathons';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col items-center justify-center gap-6 z-50">
      <img src="/logo.png" alt="HMS" className="w-14 h-14 object-contain animate-pulse" />
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-black text-slate-800 tracking-tight">HMS</span>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
          <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
        </div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu size={22} />
          </button>
          <img src="/logo.png" alt="HMS" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-slate-800">HMS</span>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/table/:tableId" element={<TableView />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<PrivateRoute />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
