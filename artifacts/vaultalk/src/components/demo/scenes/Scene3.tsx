import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3200)
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-12 bg-black/40"
      initial={{ opacity: 0, y: '20vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '-20vh' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-6xl flex gap-8 h-[80vh]">
        {/* Left: Souk Card */}
        <motion.div 
          className="flex-1 bg-[#1a153a] rounded-2xl border border-white/10 p-8 flex flex-col justify-between"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <div className="w-20 h-20 bg-violet-500/20 rounded-xl mb-6 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Senior Logo Designer</h2>
            <p className="text-white/50 text-xl">Top Rated Freelancer</p>
          </div>
          
          <motion.div 
            className="w-full py-4 bg-violet-600 rounded-xl text-center text-xl font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Negotiate with Vaultalk
          </motion.div>
        </motion.div>

        {/* Right: Negotiation Room */}
        <motion.div 
          className="flex-[1.5] bg-[#130f2b] rounded-2xl border border-violet-500/30 overflow-hidden flex flex-col"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-black/20">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white font-medium">Negotiation Room</span>
          </div>
          
          <div className="flex-1 p-6 flex flex-col gap-4">
            {phase >= 1 && (
              <motion.div className="self-end bg-violet-600 text-white py-3 px-6 rounded-2xl rounded-tr-sm max-w-[80%]"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              >
                I need a logo design for my new startup.
              </motion.div>
            )}
            
            {phase >= 2 && (
              <motion.div className="self-start bg-[#2a2456] text-white py-3 px-6 rounded-2xl rounded-tl-sm max-w-[80%]"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              >
                I can do it for 1500 SAR in 3 days. Includes 2 revisions.
              </motion.div>
            )}
          </div>

          {/* AI Extraction Panel */}
          {phase >= 3 && (
            <motion.div 
              className="m-6 p-6 bg-black/40 border border-pink-500/30 rounded-xl relative overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="absolute top-0 right-0 p-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </motion.div>
              </div>
              <h3 className="text-pink-400 font-bold mb-4 flex items-center gap-2">
                <span>Claude AI Terms Extraction</span>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/50 text-sm">Price</p>
                  <p className="text-white font-bold">1500 SAR</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/50 text-sm">Deadline</p>
                  <p className="text-white font-bold">3 days</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/50 text-sm">Revisions</p>
                  <p className="text-white font-bold">2</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      <motion.p className="absolute bottom-8 text-center text-white/60 text-xl font-medium tracking-wide"
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
      >
        Claude AI reads every word.
      </motion.p>
    </motion.div>
  );
}