import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // Uploading
      setTimeout(() => setPhase(2), 2500), // Locked
      setTimeout(() => setPhase(3), 3500)  // Client notified
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex w-full max-w-5xl h-[60vh] gap-8">
        
        {/* Left: Freelancer Panel */}
        <motion.div className="flex-1 bg-[#1a153a] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden"
          animate={phase >= 2 ? { borderColor: 'rgba(52, 211, 153, 0.5)', boxShadow: 'inset 0 0 50px rgba(52, 211, 153, 0.1)' } : {}}
        >
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Folder / Upload Area */}
            <motion.div className="absolute w-24 h-24 border-2 border-dashed border-white/20 rounded-xl" />
            
            {/* File Icon flying up */}
            <motion.div 
              className="absolute w-16 h-16 bg-violet-500 rounded-lg flex items-center justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
              transition={{ type: "spring" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            </motion.div>

            {/* Lock snaps shut */}
            <motion.div 
              className="absolute w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={phase >= 2 ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: "spring", bounce: 0.6 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </motion.div>
          </div>

          <motion.p className="mt-8 text-white text-xl font-medium text-center px-8"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : {}}
          >
            Deliverables uploaded — securely locked.
          </motion.p>
        </motion.div>

        {/* Right: Client Panel */}
        <motion.div className="flex-1 bg-[#1a153a] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden"
          animate={phase >= 3 ? { borderColor: 'rgba(52, 211, 153, 0.5)', boxShadow: 'inset 0 0 50px rgba(52, 211, 153, 0.1)' } : {}}
        >
          {phase >= 3 && (
            <motion.div 
              className="bg-emerald-500/20 text-emerald-400 py-3 px-6 rounded-full font-bold text-xl border border-emerald-500/50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              Files Ready!
            </motion.div>
          )}

          <div className="mt-8 relative">
            <motion.div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : {}}
            >
              {/* Fake StreamPay Logo */}
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </motion.div>
          </div>

          <motion.p className="mt-8 text-white text-xl font-medium text-center px-8"
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 1 } : {}}
          >
            StreamPay escrows the funds.
          </motion.p>
        </motion.div>

      </div>
    </motion.div>
  );
}