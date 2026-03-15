import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMyTeam } from '../api';
import { Users, User as UserIcon, Mail, ShieldCheck, ArrowRight, Plus } from 'lucide-react';

const Teams = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getMyTeam();
        setMembers(response.data.data || []);
      } catch (err) {
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-[#f8fafc] p-4 md:p-10 flex flex-col gap-6 md:gap-10 overflow-y-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="text-primary-600" size={26} />
            Team Members
          </h1>
          <p className="text-slate-400 font-medium text-sm">View your workspace collaborators.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-56 md:h-64 bg-white rounded-2xl md:rounded-[2.5rem] card-shadow animate-pulse"></div>
          ))
        ) : (
          members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] card-shadow border border-slate-50 group hover:border-primary-200 transition-all hover:-translate-y-1 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-primary-50 rounded-full -mr-10 -mt-10 md:-mr-12 md:-mt-12 opacity-50 group-hover:bg-primary-100 transition-colors"></div>
              
              <div className="relative mb-4 md:mb-6">
                <img 
                  src={`https://ui-avatars.com/api/?name=${member.username}&background=random&size=128`} 
                  alt={member.username}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <ShieldCheck size={10} className="text-white md:w-3 md:h-3" />
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-black text-slate-800 mb-1 group-hover:text-primary-600 transition-colors truncate w-full px-2">
                {member.username}
              </h3>
              <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 md:mb-6">
                {member.role || 'Developer'}
              </p>

              <div className="w-full mt-auto pt-4 md:pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] md:text-xs font-medium justify-center bg-slate-50 py-2.5 md:py-3 rounded-xl border border-slate-100 group-hover:border-primary-100 transition-colors">
                  <Mail size={12} className="text-slate-300 md:w-3.5 md:h-3.5 group-hover:text-primary-400" />
                  <span className="truncate max-w-[120px] md:max-w-[140px]">{member.email}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Teams;
