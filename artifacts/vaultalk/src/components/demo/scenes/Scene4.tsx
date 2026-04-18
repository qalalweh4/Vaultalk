import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 700),   // Freelancer: file appears
      setTimeout(() => setPhase(2), 1600),  // Freelancer: locked confirmation
      setTimeout(() => setPhase(3), 2400),  // Client: sees locked file
      setTimeout(() => setPhase(4), 3800),  // Client: pays
      setTimeout(() => setPhase(5), 4600),  // Files UNLOCK
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-10 gap-6 bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
      transition={{ duration: 0.7 }}
    >
      {/* Title */}
      <motion.h2
        className="text-3xl font-bold text-white tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Highly Encrypted Files Before Paying
      </motion.h2>

      {/* Split view */}
      <div className="flex w-full max-w-5xl gap-6 h-[55vh]">

        {/* ─────────────── LEFT: Freelancer ─────────────── */}
        <motion.div
          className="flex-1 rounded-2xl border border-white/10 bg-[#12102a] flex flex-col overflow-hidden"
          animate={phase >= 2
            ? { borderColor: 'rgba(52,211,153,0.5)', boxShadow: 'inset 0 0 40px rgba(52,211,153,0.08)' }
            : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-black/20">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-white/60 text-sm font-medium">Freelancer Panel</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
            {/* Upload zone */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Dashed drop zone */}
              <motion.div
                className="absolute inset-0 border-2 border-dashed border-white/20 rounded-2xl"
                animate={phase >= 1 ? { borderColor: 'rgba(139,92,246,0.5)' } : {}}
              />

              {/* File flying in */}
              <AnimatePresence>
                {phase >= 1 && phase < 2 && (
                  <motion.div
                    key="file"
                    className="absolute w-16 h-16 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/40"
                    initial={{ y: 60, opacity: 0, scale: 0.7 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lock snaps shut */}
              <AnimatePresence>
                {phase >= 2 && (
                  <motion.div
                    key="lock"
                    className="absolute w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.65, delay: 0.05 }}
                  >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.p
              className="text-white text-lg font-semibold text-center"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : {}}
            >
              Uploaded &amp; locked
            </motion.p>
            <motion.p
              className="text-emerald-400 text-sm text-center -mt-4"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : {}}
            >
              Client can't access until payment clears
            </motion.p>
          </div>
        </motion.div>

        {/* ─────────────── RIGHT: Client ─────────────── */}
        <motion.div
          className="flex-1 rounded-2xl border border-white/10 bg-[#12102a] flex flex-col overflow-hidden"
          animate={phase >= 5
            ? { borderColor: 'rgba(52,211,153,0.5)', boxShadow: 'inset 0 0 40px rgba(52,211,153,0.1)' }
            : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-black/20">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-white/60 text-sm font-medium">Client View</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">

            {/* LOCKED state */}
            <AnimatePresence mode="wait">
              {phase >= 3 && phase < 5 && (
                <motion.div
                  key="locked"
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Blurred/locked file card */}
                  <div className="relative">
                    <div className="w-56 rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3 blur-[2px] opacity-60 select-none">
                      <div className="w-10 h-10 bg-violet-500/40 rounded-lg flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/30 rounded w-24 mb-2" />
                        <div className="h-1.5 bg-white/20 rounded w-16" />
                      </div>
                    </div>
                    {/* Big red lock over it */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-red-500/90 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <p className="text-red-400 font-semibold text-base">🔒 Locked — pay to unlock</p>

                  {/* Pay button pulses on phase 4 */}
                  <motion.button
                    className="mt-1 px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm shadow-lg"
                    animate={phase >= 4
                      ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 30px rgba(99,102,241,0.7)', '0 0 10px rgba(99,102,241,0.3)'] }
                      : {}}
                    transition={{ duration: 0.6, times: [0, 0.5, 1] }}
                  >
                    Release Payment
                  </motion.button>
                </motion.div>
              )}

              {/* UNLOCKED state */}
              {phase >= 5 && (
                <motion.div
                  key="unlocked"
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  {/* Unlocked file card */}
                  <div className="w-56 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 flex items-center gap-3 shadow-lg shadow-emerald-500/20">
                    <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">logo_final.zip</p>
                      <p className="text-emerald-400 text-xs">Ready to download</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  <motion.div
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-emerald-400 font-bold text-lg">✓ Files Unlocked!</p>
                    <p className="text-white/50 text-sm">Payment released to freelancer</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>

      {/* Bottom caption */}
      <motion.p
        className="text-white/50 text-base font-medium text-center"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        StreamPay holds the escrow — no trust required.
      </motion.p>
    </motion.div>
  );
}
