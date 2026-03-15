import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, ArrowLeft, User, Clock, CheckCircle2, XCircle, Monitor, Calendar } from 'lucide-react';
import { getTableAvailability, deleteReservation } from '../api';
import { useAuth } from '../context/AuthContext';

const TableView = () => {
  const { tableId } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getTableAvailability(tableId, dateStr);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching table info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableId, dateStr]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await deleteReservation(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) return (
    <div className="flex-1 min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return (
    <div className="flex-1 min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-8">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
        <XCircle size={40} />
      </div>
      <h1 className="text-2xl font-black text-slate-800 mb-2">Masa tapılmadı</h1>
      <p className="text-slate-400 mb-10 text-center max-w-xs">Daxil etdiyiniz masa nömrəsi sistemdə mövcud deyil.</p>
      <Link to="/" className="bg-white border border-slate-200 text-slate-600 px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all font-bold card-shadow">
        <ArrowLeft size={18} /> Dashborda qayıt
      </Link>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 md:p-10 flex flex-col gap-6 md:gap-10 overflow-y-auto">
      <header className="flex items-center gap-3 md:gap-4">
        <Link to="/" className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all card-shadow flex-shrink-0">
            <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-xl md:text-3xl font-black text-slate-900">{data.tableId} Details</h1>
           <p className="text-slate-400 font-medium text-sm">Schedule for {dateStr}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10 items-start">
        {/* Desk View */}
        <div className="xl:col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 card-shadow border border-slate-50 flex flex-col items-center text-center"
          >
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl md:rounded-[2.5rem] mb-6 md:mb-10 flex items-center justify-center transform hover:rotate-0 transition-all duration-700 shadow-xl ${
              data.isOccupiedNow ? 'bg-rose-500 text-white shadow-rose-500/20 rotate-6' : 'bg-success text-white shadow-success/20 -rotate-6'
            }`}>
              <Monitor size={40} className="md:w-14 md:h-14" />
            </div>

            <div className={`inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 border ${
              data.isOccupiedNow ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${data.isOccupiedNow ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              {data.isOccupiedNow ? 'Currently Occupied' : 'Currently Available'}
            </div>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center gap-3 md:gap-4 text-slate-400">
                <QrCode size={32} className="text-primary-500/40 md:w-10 md:h-10" />
                <p className="text-[10px] md:text-[11px] font-medium text-left leading-relaxed">This desk is equipped with a unique QR code for instant check-in.</p>
            </div>
          </motion.div>
        </div>

        {/* Schedule View */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 card-shadow border border-slate-50">
            <div className="flex items-center justify-between mb-6 md:mb-10 pb-4 md:pb-6 border-b border-slate-50">
              <h3 className="text-base md:text-lg font-bold text-slate-800">Booking Schedule</h3>
              <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-primary-600 font-black text-[10px] md:text-xs border border-slate-100">
                <Calendar size={12} className="md:w-3.5 md:h-3.5" /> {dateStr}
              </div>
            </div>

            <div className="space-y-4">
              {data.reservations.length === 0 ? (
                <div className="py-20 text-center">
                  <CheckCircle2 size={48} className="text-success/20 mx-auto mb-6" />
                  <p className="text-slate-400 font-bold">No reservations for this day.</p>
                  <p className="text-slate-300 text-xs">This desk is free for all-day use.</p>
                </div>
              ) : (
                data.reservations.map((res, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100 hover:border-primary-100 hover:bg-white transition-all group gap-4">
                      <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary-600 transition-colors shadow-sm flex-shrink-0">
                          <User size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm md:text-lg font-bold text-slate-800 truncate">{res.username}</p>
                          <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Reserved Slot</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
                        <div className="bg-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-primary-600 font-black font-mono border border-slate-100 shadow-sm text-xs md:text-base">
                           {res.startTime} - {res.endTime}
                        </div>
                        {user?.username === res.username && (() => {
                          const now = new Date();
                          const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                          
                          // Check if the reservation has already started or passed
                          const isStartedOrPassed = res.date < todayStr || (res.date === todayStr && res.startTime <= currentTime);
                          
                          if (isStartedOrPassed) return <div className="w-9 h-9 md:w-10 flex-shrink-0"></div>;
                          
                          return (
                            <button 
                              onClick={() => handleCancel(res._id)}
                              className="w-9 h-9 md:w-10 md:h-10 bg-rose-50 text-rose-500 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex-shrink-0"
                              title="Cancel Reservation"
                            >
                              <XCircle size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableView;
