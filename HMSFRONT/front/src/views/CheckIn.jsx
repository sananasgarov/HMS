import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, QrCode, ArrowLeft } from 'lucide-react';
import { checkInTable } from '../api';

const CheckIn = () => {
    const { deskId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleCheckIn = async () => {
        setLoading(true);
        setError('');
        try {
            await checkInTable(deskId);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed. Make sure you have an active reservation for this desk.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 card-shadow border border-slate-50 text-center relative overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    {success ? (
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
                                    disabled={loading}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-6 rounded-3xl transition-all shadow-xl shadow-primary-500/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            Processing...
                                        </>
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
