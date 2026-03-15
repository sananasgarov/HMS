import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, QrCode, ArrowLeft, Clock, User } from 'lucide-react';
import { checkInTable, getTableAvailability } from '../api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const CheckIn = () => {
    const { deskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [activeRes, setActiveRes] = useState(null);
    const [upcomingRes, setUpcomingRes] = useState([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const today = format(new Date(), 'yyyy-MM-dd');
                const response = await getTableAvailability(deskId, today);
                const reservations = response.data.data.reservations || [];
                
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                
                // Find reservation that is currently active.
                // It's strictly less than endTime so back-to-back reservations (e.g., 16:00-17:00 and 17:00-18:00) don't conflict at exactly 17:00.
                const current = reservations.find(res => 
                    currentTime >= res.startTime && currentTime < res.endTime
                );

                // Find upcoming reservations for later today
                const upcoming = reservations.filter(res => 
                    res.startTime > currentTime || (current && res.startTime === current.endTime)
                );
                
                setActiveRes(current || null);
                setUpcomingRes(upcoming);
            } catch (err) {
                console.error("Failed to fetch desk availability", err);
                setError("Failed to load desk information.");
            } finally {
                setFetching(false);
            }
        };
        fetchAvailability();
    }, [deskId]);

    const handleCheckIn = async () => {
        setLoading(true);
        setError('');
        try {
            const now = new Date();
            const clientDateStr = format(now, 'yyyy-MM-dd');
            const clientTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            await checkInTable(deskId, clientTimeStr, clientDateStr);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed. Make sure you have an active reservation for this desk.');
        } finally {
            setLoading(false);
        }
    };

    const isReservedByMe = activeRes && activeRes.username === user?.username;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 card-shadow border border-slate-50 text-center relative overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    {fetching ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-10 gap-4"
                        >
                            <Loader2 size={40} className="animate-spin text-primary-500" />
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Checking desk status...</p>
                        </motion.div>
                    ) : success ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm">
                                <CheckCircle2 size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-slate-800">Check-in Successful!</h2>
                                <p className="text-slate-400 font-medium leading-relaxed">
                                    The desk <b>{deskId}</b> is now marked as <b>Occupied</b>. Have a productive session!
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate('/')}
                                className="mt-4 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg flex items-center gap-2 uppercase tracking-widest text-sm"
                            >
                                <ArrowLeft size={18} />
                                Back to Dashboard
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600 shadow-lg shadow-primary-500/10">
                                    <QrCode size={40} />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-black text-slate-900">Desk Check-in</h1>
                                    <p className="text-slate-400 font-medium">Welcome to <b>{deskId}</b></p>
                                </div>
                            </div>

                            {/* Reservation Details Card */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-4">
                                {activeRes ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex flex-shrink-0 items-center justify-center overflow-hidden">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${activeRes.username}&background=random`} 
                                                    alt={activeRes.username}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Reserved By</p>
                                                <p className="text-sm font-black text-slate-800 truncate">{activeRes.username} {isReservedByMe ? '(You)' : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 font-bold bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <Clock size={16} className="text-primary-400" />
                                            <span className="text-sm">{activeRes.startTime} - {activeRes.endTime}</span>
                                            {activeRes.status === 'occupied' && (
                                                <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase tracking-wider">Checked In</span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4 space-y-2">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-400">
                                            <Clock size={20} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">No active reservation at this time.</p>
                                    </div>
                                )}
                            </div>

                            {/* Upcoming Reservations List */}
                            {upcomingRes.length > 0 && (
                                <div className="text-left space-y-3 pt-2">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Later Today</h3>
                                    <div className="space-y-2">
                                        {upcomingRes.map((res, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 overflow-hidden">
                                                        <img 
                                                            src={`https://ui-avatars.com/api/?name=${res.username}&background=random`} 
                                                            alt={res.username}
                                                            className="w-full h-full opacity-80"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-700">{res.username}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Upcoming</p>
                                                    </div>
                                                </div>
                                                <div className="text-[11px] font-black text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg">
                                                    {res.startTime} - {res.endTime}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold text-left"
                                >
                                    <AlertCircle size={20} className="shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <button
                                    onClick={handleCheckIn}
                                    disabled={loading || !activeRes || !isReservedByMe || activeRes.status === 'occupied'}
                                    className={`w-full font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest ${
                                        (!activeRes || !isReservedByMe || activeRes.status === 'occupied') 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/30 active:scale-95'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : !activeRes ? (
                                        'Not Available'
                                    ) : !isReservedByMe ? (
                                        'Reserved By Others'
                                    ) : activeRes.status === 'occupied' ? (
                                        'Already Checked-In'
                                    ) : (
                                        'Check-in Now'
                                    )}
                                </button>
                                <p className="mt-6 text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">
                                    Only scan when you are at the desk
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default CheckIn;
