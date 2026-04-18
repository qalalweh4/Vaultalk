import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function SceneKey() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 600),   // file appears
      setTimeout(() => setPhase(2), 1400),  // encrypted label
      setTimeout(() => setPhase(3), 2300),  // StreamPay processes
      setTimeout(() => setPhase(4), 3300),  // invoice ID revealed
      setTimeout(() => setPhase(5), 4200),  // key unlocks file
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-16 gap-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.7 }}
    >
      {/* Title */}
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <h2 className="text-4xl font-black text-white tracking-tight">
          The Key is the{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Invoice ID
          </span>
        </h2>
        <p className="text-white/50 text-lg mt-2">
          StreamPay only releases it when payment succeeds — not even Vaultalk knows it before then.
        </p>
      </motion.div>

      {/* Flow diagram */}
      <div className="flex items-center justify-center gap-0 w-full max-w-5xl">

        {/* FILE (encrypted) */}
        <motion.div
          className="flex flex-col items-center gap-3 w-52"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
          transition={{ type: 'spring', bounce: 0.3 }}
        >
          <div className="relative">
            <div className="w-24 h-28 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#1e1b4b,#2e1065)', border: '1px solid rgba(139,92,246,0.4)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
              </svg>
              <span className="text-[9px] text-white/50 font-mono">logo_final.zip</span>

              {/* AES overlay */}
              <AnimatePresence>
                {phase >= 2 && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.15)', backdropFilter: 'blur(2px)' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span className="text-[8px] text-red-400 font-mono mt-1">AES-256</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-white/60 text-sm font-semibold text-center">Encrypted File</p>
          <p className="text-white/30 text-xs text-center">Stored on server,<br/>unreadable without key</p>
        </motion.div>

        {/* Arrow 1 */}
        <motion.div className="flex flex-col items-center gap-1 w-24"
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0.15 }} transition={{ duration: 0.4 }}>
          <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
            <path d="M4 10 H68 M60 4 L76 10 L60 16" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[9px] text-white/30 font-mono text-center">payment<br/>confirmed</span>
        </motion.div>

        {/* STREAMPAY */}
        <motion.div
          className="flex flex-col items-center gap-3 w-52"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', bounce: 0.3 }}
        >
          <div className="w-24 h-28 rounded-xl flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', border: '1px solid rgba(59,130,246,0.4)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span className="text-[9px] text-blue-300 font-mono">StreamPay</span>

            {/* spinning confirm */}
            {phase === 3 && (
              <motion.div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} />
            )}
            {phase >= 4 && (
              <motion.div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </motion.div>
            )}
          </div>
          <p className="text-white/60 text-sm font-semibold text-center">StreamPay API</p>
          <p className="text-white/30 text-xs text-center">Webhook fires on<br/>payment success</p>
        </motion.div>

        {/* Arrow 2 with invoice ID */}
        <div className="flex flex-col items-center gap-1 w-28">
          <motion.div animate={phase >= 4 ? { opacity: 1 } : { opacity: 0.1 }} transition={{ duration: 0.4 }}>
            <svg width="90" height="20" viewBox="0 0 90 20" fill="none">
              <path d="M4 10 H78 M70 4 L86 10 L70 16" stroke="rgba(52,211,153,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </motion.div>
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                className="px-2 py-1 rounded-md font-mono text-[9px] text-emerald-400 text-center"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}>
                invoice_id:<br/>
                <span className="text-white/60">sp_4f8a2c...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* UNLOCKED FILE */}
        <motion.div
          className="flex flex-col items-center gap-3 w-52"
          animate={phase >= 5 ? { opacity: 1, x: 0 } : { opacity: 0.15, x: 20 }}
          transition={{ type: 'spring', bounce: 0.35 }}
        >
          <div className="relative">
            <motion.div
              className="w-24 h-28 rounded-xl flex flex-col items-center justify-center gap-2"
              animate={phase >= 5
                ? { borderColor: 'rgba(52,211,153,0.6)', background: 'linear-gradient(135deg,#064e3b,#065f46)' }
                : { borderColor: 'rgba(255,255,255,0.08)', background: 'linear-gradient(135deg,#1e1b4b,#2e1065)' }}
              style={{ border: '1px solid' }}
              transition={{ duration: 0.4 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={phase >= 5 ? '#34d399' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
              </svg>
              {phase >= 5 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                </motion.div>
              )}
            </motion.div>
          </div>
          <p className={`text-sm font-semibold text-center ${phase >= 5 ? 'text-emerald-400' : 'text-white/30'}`}>
            {phase >= 5 ? '✓ Decrypted & Accessible' : 'Still Locked'}
          </p>
          <p className="text-white/30 text-xs text-center">
            {phase >= 5 ? 'Client can now download' : 'Waiting for invoice ID'}
          </p>
        </motion.div>
      </div>

      {/* Bottom insight */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            className="flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-emerald-400 text-xl">🔑</span>
            <p className="text-white/70 text-sm">
              <span className="text-white font-semibold">StreamPay Invoice ID</span> is the AES decryption key —{' '}
              <span className="text-emerald-400 font-semibold">only released when payment clears</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
