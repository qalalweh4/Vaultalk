import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500)
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: '-100vh' }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-center w-full max-w-5xl relative h-64">
        
        {/* Client Side */}
        <motion.div 
          className="absolute left-[10%] bg-[#1a153a] p-6 rounded-2xl border border-emerald-500/50 w-64 flex flex-col items-center"
          initial={{ x: -100, opacity: 0 }}
          animate={phase >= 1 ? { x: 0, opacity: 1 } : {}}
          transition={{ type: "spring" }}
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h3 className="text-white font-bold text-xl">Client</h3>
          <p className="text-emerald-400 font-medium">Files Delivered</p>
        </motion.div>

        {/* Contract PDF */}
        <motion.div 
          className="absolute z-10 w-72 h-80 bg-white rounded-lg shadow-2xl flex flex-col p-4"
          initial={{ y: 100, opacity: 0, rotateX: 45 }}
          animate={phase >= 2 ? { y: 0, opacity: 1, rotateX: 0 } : {}}
          transition={{ type: "spring", damping: 15 }}
        >
          <div className="w-full h-12 border-b border-gray-200 mb-4 flex justify-between items-center">
            <div className="w-1/3 h-2 bg-gray-300 rounded"></div>
            <div className="w-8 h-8 bg-violet-500/20 rounded flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            <div className="w-full h-2 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-2 bg-gray-200 rounded"></div>
            <div className="w-4/6 h-2 bg-gray-200 rounded"></div>
            <div className="w-full h-2 bg-gray-200 rounded mt-6"></div>
            <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-auto flex justify-center">
            <div className="border-2 border-violet-500 text-violet-500 font-bold px-4 py-1 transform -rotate-12 rounded">
              AI-WITNESSED
            </div>
          </div>
        </motion.div>

        {/* Freelancer Side */}
        <motion.div 
          className="absolute right-[10%] bg-[#1a153a] p-6 rounded-2xl border border-emerald-500/50 w-64 flex flex-col items-center"
          initial={{ x: 100, opacity: 0 }}
          animate={phase >= 1 ? { x: 0, opacity: 1 } : {}}
          transition={{ type: "spring" }}
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 className="text-white font-bold text-xl">Freelancer</h3>
          <p className="text-emerald-400 font-medium">Payment Released</p>
        </motion.div>

      </div>

      <motion.h2 className="text-5xl font-bold text-white mt-24 text-center leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
      >
        No disputes. No chasing.<br/>
        <span className="text-emerald-400">Just trust.</span>
      </motion.h2>

    </motion.div>
  );
}