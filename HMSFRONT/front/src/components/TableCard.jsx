import React from 'react';
import { motion } from 'framer-motion';

const TableCard = ({ tableId, reservations = [], filterTime, onClick, showHighlight }) => {
  const currentTime = filterTime || (new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0'));
  
  const currentRes = reservations.find(res => 
    currentTime >= res.startTime && currentTime <= res.endTime
  );

  const isOccupied = !!currentRes;
  let bgColor = isOccupied ? (showHighlight ? 'bg-yellow-400' : 'bg-danger') : 'bg-success';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(tableId)}
      className={`${bgColor} relative group flex items-center justify-center rounded-lg md:rounded-2xl cursor-pointer
        w-6 h-6 md:w-11 md:h-11 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <span className={`text-[6px] md:text-[10px] font-black ${showHighlight && isOccupied ? 'text-yellow-900/70' : 'text-white/70'} group-hover:${showHighlight && isOccupied ? 'text-yellow-900' : 'text-white'} transition-colors`}>
        {tableId.split(' ')[1]}
      </span>
      {isOccupied && (
        <div className="absolute -top-px -right-px w-1.5 h-1.5 md:w-3 md:h-3 bg-white rounded-full border border-rose-500 md:border-2"></div>
      )}
    </motion.div>
  );
};

export default TableCard;
