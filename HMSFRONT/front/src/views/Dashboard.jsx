import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Map as MapIcon, 
  Flame, 
  CheckCircle2, 
  AlertCircle,   Clock,
   ArrowRight,
   Search,
   Calendar as CalendarIcon,
   Users,
   Loader2
 } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import TableCard from '../components/TableCard';
import { getReservations, getMyRecentReservations, deleteReservation } from '../api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [reservations, setReservations] = useState([]);
  const [recentRes, setRecentRes] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultStart = format(new Date(), 'HH:mm');
  const [filterStartTime, setFilterStartTime] = useState(defaultStart);
  
  // Calculate default end time (+2 hours)
  const defaultEndObj = new Date();
  defaultEndObj.setHours(defaultEndObj.getHours() + 2);
  const defaultEnd = format(defaultEndObj, 'HH:mm');
  const [filterEndTime, setFilterEndTime] = useState(defaultEnd);

  const [showTeamMembers, setShowTeamMembers] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
  const navigate = useNavigate();

  const fetchRes = async () => {
    try {
      setLoading(true);
      const targetDate = format(new Date(), 'yyyy-MM-dd');
      const [resRes, recent] = await Promise.all([
        getReservations(targetDate),
        getMyRecentReservations()
      ]);
      setReservations(resRes.data.data || []);
      setRecentRes(recent.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await deleteReservation(id);
      fetchRes(); // Refresh data after cancellation
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  useEffect(() => {
    fetchRes();
  }, []);

  const tables = Array.from({ length: 86 }, (_, i) => `Stol ${i + 1}`);
  
  // Calculate Recommendation (Most frequent desk in last week)
  const getFavoriteDesk = () => {
    if (!recentRes.length) return "Stol 1";
    const counts = {};
    recentRes.forEach(r => {
      counts[r.tableName] = (counts[r.tableName] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const favoriteDesk = getFavoriteDesk();

  const handleQuickBook = () => {
    const now = format(new Date(), 'HH:mm');
    const occupiedTables = reservations
      .filter(r => now >= r.startTime && now <= r.endTime)
      .map(r => r.tableName);
    
    const availableTables = tables.filter(t => !occupiedTables.includes(t));
    if (availableTables.length > 0) {
      const randomTable = availableTables[Math.floor(Math.random() * availableTables.length)];
      setSelectedTable(randomTable);
      setIsModalOpen(true);
    }
  };

  // A desk is considered occupied if ANY reservation overlaps the selected time range.
  // Overlap condition: res.startTime < filterEndTime && res.endTime > filterStartTime
  const stats = {
    available: tables.length - reservations.filter(r => {
        return r.startTime < filterEndTime && r.endTime > filterStartTime;
    }).length,
    occupied: reservations.filter(r => {
        return r.startTime < filterEndTime && r.endTime > filterStartTime;
    }).length
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto relative">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-primary-600"
            >
              <Loader2 size={48} />
            </motion.div>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-slate-600 font-black text-sm uppercase tracking-widest"
            >
              Syncing Dashboard...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900">Main Office Floor</h1>
          <p className="text-slate-400 font-medium text-sm">Real-time desk tracking & management</p>
        </div>    
        <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => {
                setSelectedTable(favoriteDesk);
                setIsModalOpen(true);
              }}
              className="group flex items-center gap-2 bg-white text-slate-700 hover:text-primary-600 font-bold px-4 py-2.5 md:py-3 rounded-xl transition-all border border-slate-200 hover:border-primary-100 shadow-sm text-sm whitespace-nowrap"
            >
                <Flame size={18} className="text-orange-500 group-hover:animate-bounce" /> 
                <span className="hidden sm:inline">Recommended: {favoriteDesk}</span>
                <span className="sm:hidden">{favoriteDesk}</span>
            </button>
            <button 
              onClick={handleQuickBook}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 text-sm whitespace-nowrap"
            >
              Quick Book
            </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white rounded-[2rem] p-4 md:p-6 card-shadow border border-slate-50 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="flex gap-2">
                {/* Start Time Picker */}
                <div className="relative flex-1">
                    <button 
                        onClick={() => {
                            setIsStartTimePickerOpen(!isStartTimePickerOpen);
                            setIsEndTimePickerOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 px-3 py-3 rounded-2xl w-full hover:border-primary-100 transition-all group"
                    >
                        <Clock className="text-primary-400 group-hover:scale-110 transition-transform hidden sm:block" size={16} />
                        <span className="text-sm font-black text-slate-600">{filterStartTime}</span>
                    </button>
                    
                    <AnimatePresence>
                        {isStartTimePickerOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto p-2 scrollbar-thin"
                            >
                                {Array.from({ length: 48 }, (_, i) => {
                                    const hour = Math.floor(i / 2).toString().padStart(2, '0');
                                    const min = (i % 2 === 0 ? '00' : '30');
                                    const time = `${hour}:${min}`;
                                    return (
                                        <button 
                                            key={time}
                                            onClick={() => {
                                                setFilterStartTime(time);
                                                if (time >= filterEndTime) {
                                                    const nextI = i < 47 ? i + 1 : 47;
                                                    const nextHour = Math.floor(nextI / 2).toString().padStart(2, '0');
                                                    const nextMin = (nextI % 2 === 0 ? '00' : '30');
                                                    setFilterEndTime(`${nextHour}:${nextMin}`);
                                                }
                                                setIsStartTimePickerOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                filterStartTime === time 
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
                
                <div className="flex items-center text-slate-300 font-bold">-</div>

                {/* End Time Picker */}
                <div className="relative flex-1">
                    <button 
                        onClick={() => {
                            setIsEndTimePickerOpen(!isEndTimePickerOpen);
                            setIsStartTimePickerOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 px-3 py-3 rounded-2xl w-full hover:border-primary-100 transition-all group"
                    >
                        <Clock className="text-primary-400 group-hover:scale-110 transition-transform hidden sm:block" size={16} />
                        <span className="text-sm font-black text-slate-600">{filterEndTime}</span>
                    </button>
                    
                    <AnimatePresence>
                        {isEndTimePickerOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto p-2 scrollbar-thin"
                            >
                                {Array.from({ length: 48 }, (_, i) => {
                                    const hour = Math.floor(i / 2).toString().padStart(2, '0');
                                    const min = (i % 2 === 0 ? '00' : '30');
                                    const time = `${hour}:${min}`;
                                    // Disable times before start time
                                    const isDisabled = time <= filterStartTime;
                                    return (
                                        <button 
                                            key={time}
                                            onClick={() => {
                                                if(!isDisabled){
                                                    setFilterEndTime(time);
                                                    setIsEndTimePickerOpen(false);
                                                }
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                isDisabled 
                                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                                : filterEndTime === time 
                                                    ? 'bg-primary-50 text-primary-600' 
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                            disabled={isDisabled}
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
            
            <button 
              onClick={() => fetchRes()}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Filter
            </button>
        </div>
        
        <div className="w-full md:w-auto">
            <button 
              onClick={() => setShowTeamMembers(!showTeamMembers)}
              className={`w-full md:w-auto flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-2xl transition-all border shadow-sm active:scale-95 ${
                showTeamMembers 
                ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-yellow-200' 
                : 'bg-white border-slate-200 text-slate-700 hover:border-primary-100'
              }`}
            >
              <Users size={18} className={showTeamMembers ? 'text-yellow-900' : 'text-primary-400'} />
              Team Member
            </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
        {/* Main Content: Desk Map */}
        <div className="flex-[3] space-y-5 md:space-y-8">
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-2 md:p-8 card-shadow border border-slate-50">
            {/* Map Controls: legend */}
            <div className="flex flex-wrap items-center gap-3 md:gap-8 mb-3 md:mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-xs font-bold text-slate-400">Available ({stats.available})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger"></div>
                <span className="text-xs font-bold text-slate-400">Occupied ({stats.occupied})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 md:gap-5 mb-1.5 md:mb-4">
              {[0, 1].map(i => (
                <div key={i} className="bg-slate-50 rounded-xl md:rounded-3xl p-1.5 md:p-4 border border-slate-100">
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {tables.slice(i * 5, i * 5 + 5).map(tableId => {
                      const tableRes = reservations.filter(r => r.tableName === tableId);
                      return (
                        <div key={tableId}>
                            <TableCard 
                              tableId={tableId}
                              reservations={tableRes}
                              filterStartTime={filterStartTime}
                              filterEndTime={filterEndTime}
                              showHighlight={showTeamMembers}
                              onClick={id => { setSelectedTable(id); setIsModalOpen(true); }}
                            />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ─── MIDDLE: 3 rows, each with a Left table (9 desk) and Right table (10 desks) ─── */}
            <div className="space-y-1.5 md:space-y-4">
              {[0, 1, 2, 3].map(row => {
                const leftStart = 10 + row * 19;
                const rightStart = leftStart + 9;
                return (
                  <div key={row} className="flex gap-1.5 md:gap-5">
                    {/* Left table: 4+4 grid + 1 solo */}
                    <div className="bg-slate-50 rounded-xl md:rounded-3xl p-1.5 md:p-4 border border-slate-100 flex items-center gap-1.5 md:gap-4">
                      <div className="grid grid-cols-4 gap-1 md:gap-2">
                        {tables.slice(leftStart, leftStart + 8).map(tableId => {
                          const tableRes = reservations.filter(r => r.tableName === tableId);
                          return (
                            <div key={tableId}>
                                <TableCard 
                                  tableId={tableId}
                                  reservations={tableRes}
                                  filterStartTime={filterStartTime}
                                  filterEndTime={filterEndTime}
                                  showHighlight={showTeamMembers}
                                  onClick={id => { setSelectedTable(id); setIsModalOpen(true); }}
                                />
                            </div>
                          );
                        })}
                      </div>
                      {/* Solo desk at right end */}
                      <div className="border-l border-slate-200 pl-1.5 md:pl-3">
                        {(() => {
                           const tId = tables[leftStart + 8];
                           const tableRes = reservations.filter(r => r.tableName === tId);
                           return (
                             <div key={tId}>
                               <TableCard tableId={tId}
                                  reservations={tableRes}
                                  filterStartTime={filterStartTime}
                                  filterEndTime={filterEndTime}
                                  showHighlight={showTeamMembers}
                                  onClick={id => { setSelectedTable(id); setIsModalOpen(true); }}
                                />
                             </div>
                           );
                        })()}
                      </div>
                    </div>

                    {/* Right table: 5+5 grid */}
                    <div className="bg-slate-50 rounded-xl md:rounded-3xl p-1.5 md:p-4 border border-slate-100">
                      <div className="grid grid-cols-5 gap-1 md:gap-2">
                        {tables.slice(rightStart, rightStart + 10).map(tableId => {
                          const tableRes = reservations.filter(r => r.tableName === tableId);
                          return (
                            <div key={tableId}>
                                <TableCard 
                                  tableId={tableId}
                                  reservations={tableRes}
                                  filterStartTime={filterStartTime}
                                  filterEndTime={filterEndTime}
                                  showHighlight={showTeamMembers}
                                  onClick={id => { setSelectedTable(id); setIsModalOpen(true); }}
                                />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="xl:flex-1 space-y-6 md:space-y-8 flex flex-col min-h-0">
          {/* Today's Reservation - New Section */}
          <AnimatePresence mode='wait'>
            {recentRes.find(r => r.date === format(new Date(), 'yyyy-MM-dd') && r.endTime > format(new Date(), 'HH:mm')) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[2.5rem] p-8 card-shadow border-2 border-primary-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <CheckCircle2 size={60} className="text-primary-600" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">My Reservation (Today)</h3>
                </div>
                
                {(() => {
                  const nowStr = format(new Date(), 'HH:mm');
                  const todayRes = recentRes.find(r => r.date === format(new Date(), 'yyyy-MM-dd') && r.endTime > nowStr);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-2xl font-black text-slate-800">{todayRes.tableName}</h4>
                        <span className="text-[10px] font-black bg-primary-600 text-white px-3 py-1 rounded-full uppercase">Active</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary-400" />
                          <span>{todayRes.startTime} - {todayRes.endTime}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/table/${todayRes.tableName}`)}
                          className="flex-1 flex items-center justify-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest py-3 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all"
                        >
                          View Schedule
                        </button>
                        <button 
                          onClick={() => handleCancel(todayRes._id)}
                          className="flex-1 flex items-center justify-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest py-3 hover:bg-rose-50 rounded-xl transition-all border border-rose-100"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recommendation Card */}
          <div className="hidden xl:block bg-primary-600 rounded-[2.5rem] p-4 p-8 text-white card-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Plus size={80} />
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Flame size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Best spot for you</h3>
            <p className="text-primary-100/70 text-sm mb-8 leading-relaxed">
              Based on your recent bookings, <b>{favoriteDesk}</b> is your favorite spot and currently recommended.
            </p>
            <button 
              onClick={() => {
                setSelectedTable(favoriteDesk);
                setIsModalOpen(true);
              }}
              className="w-full bg-white text-primary-600 font-bold py-3.5 rounded-xl text-sm shadow-xl active:scale-95 transition-all"
            >
              Book Now
            </button>
          </div>

          {/* Who's at the Office Section */}
          <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-slate-50 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Who's at the Office?</h3>
                <span className="text-[10px] font-black text-primary-500 bg-primary-50 px-2 py-1 rounded-md uppercase">
                    {filterStartTime} - {filterEndTime}
                </span>
            </div>
            
            <div className="space-y-3 overflow-y-auto pr-2 mac-scrollbar max-h-[300px]">
              {(() => {
                const nowStr = format(new Date(), 'HH:mm');
                // Show anyone who is currently there or has an upcoming reservation today
                const occupants = reservations.filter(r => 
                   r.endTime > nowStr
                );
                
                if (occupants.length === 0) return (
                    <div className="py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-bold">No one at this time.</p>
                    </div>
                );

                return occupants.map((occ, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-100 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${occ.username}&background=random&size=64`} 
                                alt={occ.username}
                                className="w-full h-full"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{occ.username}</p>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-black text-primary-500 uppercase flex items-center gap-1">
                                    <MapIcon size={10} /> {occ.tableName}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                    <Clock size={10} /> {occ.startTime} - {occ.endTime}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ));
              })()}
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-slate-50 flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Rezervation</h3>
            <div className="space-y-4">
              {recentRes.slice(0, 5).map((res, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/table/${res.tableName}`)}
                  className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all"
                >
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:border-primary-200 transition-colors shadow-sm">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-tighter leading-none">
                      {format(new Date(res.date), 'MMM')}
                    </span>
                    <span className="text-lg font-black text-slate-700 leading-none">
                      {format(new Date(res.date), 'dd')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{res.tableName}</h4>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={10} /> {res.startTime} - {res.endTime}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-slate-200 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
              {recentRes.length === 0 && (
                <p className="text-slate-300 text-xs italic text-center py-4">No recent bookings found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BookingModal 
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTable('');
            }} 
            initialTable={selectedTable}
            onSuccess={() => {
              setIsModalOpen(false);
              setSelectedTable('');
              fetchRes();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
