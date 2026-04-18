import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
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
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.2 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Danger background bleed */}
      <motion.div 
        className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 via-transparent to-transparent"
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative w-full max-w-4xl h-64 mb-12 flex items-center justify-center">
        {/* Chaos elements */}
        {phase >= 1 && Array.from({ length: 15 }).map((_, i) => (
          <motion.div key={i} 
            className="absolute w-12 h-12 bg-white/5 rounded-xl border border-red-500/20"
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
            animate={{ 
              x: (Math.random() - 0.5) * 800, 
              y: (Math.random() - 0.5) * 400, 
              opacity: [0, 0.5, 0], 
              rotate: (Math.random() - 0.5) * 360 
            }}
            transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
          />
        ))}

        <motion.div className="relative z-10"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          {/* Broken Contract Icon */}
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
            <path d="M12 2v20" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
          </svg>
        </motion.div>
      </div>

      <div className="text-center z-10">
        <motion.h2 className="text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          The Problem
        </motion.h2>
        
        <div className="flex flex-col gap-2">
          <motion.p className="text-3xl font-medium text-red-400"
            initial={{ opacity: 0, x: -50 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Freelancers lose money.
          </motion.p>
          <motion.p className="text-3xl font-medium text-orange-400"
            initial={{ opacity: 0, x: 50 }}
            animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Clients get nothing.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}