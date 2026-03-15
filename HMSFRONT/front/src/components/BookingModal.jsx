import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Monitor, CheckCircle2, AlertCircle, ArrowRight, ArrowUpRight } from 'lucide-react';
import { createReservation, getTableAvailability } from '../api';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const BookingModal = ({ onClose, onSuccess, initialTable = '' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tableName: initialTable,
    date: new Date().toISOString().split('T')[0],
    startTime: `${String(new Date().getHours()).padStart(2, '0')}:00`,
    endTime: `${String(new Date().getHours() + 1).padStart(2, '0')}:00`,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  const tables = Array.from({ length: 86 }, (_, i) => `Stol ${i + 1}`);

  const fetchAvailability = async (tableName) => {
    if (!tableName) return;
    setStatusLoading(true);
    try {
      const { data } = await getTableAvailability(tableName, formData.date);
      setAvailability(data.data);
    } catch (err) {
      console.error('Error fetching availability');
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability(formData.tableName);
  }, [formData.tableName]);

  const getStatusDisplay = () => {
    if (statusLoading) return { text: 'Checking status...', color: 'text-slate-400' };
    if (!availability) return null;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const activeRes = availability.reservations.find(r => 
        currentTime >= r.startTime && currentTime < r.endTime
    );

    if (activeRes) {
        return { 
            text: `Occupied until ${activeRes.endTime}`, 
            color: 'text-rose-500', 
            bg: 'bg-rose-50',
            icon: <AlertCircle size={14} />,
            user: activeRes.username
        };
    }

    const nextRes = availability.reservations.find(r => r.startTime > currentTime);
    if (nextRes) {
        return { 
            text: `Available until ${nextRes.startTime}`, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-50',
            icon: <CheckCircle2 size={14} />
        };
    }

    return { 
        text: 'Available for the rest of the day', 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50',
        icon: <CheckCircle2 size={14} />
    };
  };

  const status = getStatusDisplay();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend Rule: Cannot book for the past
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (formData.date === todayStr && formData.startTime < currentTime) {
        setError(`Cannot book for the past. Current time is ${currentTime}.`);
        return;
    }

    if (formData.startTime >= formData.endTime) {
        setError("End time must be after start time.");
        return;
    }

    setLoading(true);
    try {
      await createReservation(formData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Time slot might be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="w-full max-w-xl bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 relative shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Success Overlay */}
        <AnimatePresence>
            {success && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-10 text-center"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 shadow-sm">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Successfully Booked!</h2>
                    <p className="text-slate-400 font-medium leading-relaxed">Your desk is ready. You'll receive a confirmation email shortly.</p>
                </motion.div>
            )}
        </AnimatePresence>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-300 hover:text-slate-600 transition-colors z-30"
        >
          <X size={22} />
        </button>

        <header className="mb-5 md:mb-10 relative z-10 pr-10 flex justify-between items-start">
            <div>
                <h2 className="text-xl md:text-3xl font-black text-slate-800 mb-1 md:mb-2 tracking-tight">Reserve a Desk</h2>
                <p className="text-slate-400 font-medium text-xs md:text-sm">Select your preferred time slot and location.</p>
            </div>
            {formData.tableName && (
                <button
                    onClick={() => navigate(`/table/${formData.tableName}`)}
                    className="flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl hover:bg-primary-100 transition-colors flex-shrink-0"
                >
                    View Schedule <ArrowUpRight size={12} />
                </button>
            )}
        </header>

        {error && (
            <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-semibold relative z-10"
            >
                <AlertCircle size={18} />
                {error}
            </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8 relative z-10">
            <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2.5 ml-1">Desk Placement</label>
                <div className="relative">
                <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-700 font-bold focus:outline-none focus:border-primary-400 transition-all appearance-none shadow-sm"
                    value={formData.tableName}
                    onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                    required
                >
                    <option value="" disabled>Select a desk</option>
                    {tables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                </div>
                
                {status && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 px-4 py-3 rounded-xl border flex items-center justify-between ${status.bg} ${status.color.replace('text-', 'border-').replace('500', '100')}`}
                    >
                        <div className="flex items-center gap-2">
                            {status.icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{status.text}</span>
                        </div>
                        {status.user && (
                            <span className="text-[9px] font-bold opacity-60">By {status.user}</span>
                        )}
                    </motion.div>
                )}
            </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2.5 ml-1">Start Time</label>
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsStartTimeOpen(!isStartTimeOpen)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-9 pr-2 py-3 md:py-4 text-slate-700 font-bold focus:outline-none focus:border-primary-400 transition-all shadow-sm text-sm text-left flex items-center relative"
                        >
                            <Clock className="absolute left-3 text-slate-300" size={16} />
                            {formData.startTime}
                        </button>
                        
                        <AnimatePresence>
                            {isStartTimeOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] max-h-48 overflow-y-auto p-2 scrollbar-thin"
                                >
                                    {Array.from({ length: 1440 }, (_, i) => {
                                        const hour = Math.floor(i / 60).toString().padStart(2, '0');
                                        const min = (i % 60).toString().padStart(2, '0');
                                        const time = `${hour}:${min}`;
                                        
                                        // Disable past times for today
                                        const now = new Date();
                                        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                        const isPast = formData.date === new Date().toISOString().split('T')[0] && time < currentTime;
                                        
                                        if (isPast) return null;

                                        return (
                                            <button 
                                                key={time}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, startTime: time });
                                                    setIsStartTimeOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                                    formData.startTime === time 
                                                    ? 'bg-primary-50 text-primary-600' 
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                                }`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2.5 ml-1">End Time</label>
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsEndTimeOpen(!isEndTimeOpen)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-9 pr-2 py-3 md:py-4 text-slate-700 font-bold focus:outline-none focus:border-primary-400 transition-all shadow-sm text-sm text-left flex items-center relative"
                        >
                            <Clock className="absolute left-3 text-slate-300" size={16} />
                            {formData.endTime}
                        </button>
                        
                        <AnimatePresence>
                            {isEndTimeOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] max-h-48 overflow-y-auto p-2 scrollbar-thin"
                                >
                                    {Array.from({ length: 1440 }, (_, i) => {
                                        const hour = Math.floor(i / 60).toString().padStart(2, '0');
                                        const min = (i % 60).toString().padStart(2, '0');
                                        const time = `${hour}:${min}`;
                                        
                                        // End time should be after start time
                                        if (time <= formData.startTime) return null;

                                        return (
                                            <button 
                                                key={time}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, endTime: time });
                                                    setIsEndTimeOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                                    formData.endTime === time 
                                                    ? 'bg-primary-50 text-primary-600' 
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                                }`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <button
            type="submit"
            disabled={loading}
            className="w-full py-4 md:py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2 md:mt-4"
            >
                {loading ? 'Processing...' : 'Confirm Reservation'}
                {!loading && <ArrowRight size={20} />}
            </button>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingModal;
