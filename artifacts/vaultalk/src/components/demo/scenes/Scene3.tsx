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
      className="absolute inset-0 flex items-center justify-center p-10 bg-black/40"
      initial={{ opacity: 0, y: '20vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '-20vh' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-6xl flex gap-6" style={{ height: '76vh' }}>

        {/* ── Left: Souk marketplace listing card ── */}
        <motion.div
          className="w-72 flex-shrink-0 bg-[#1a153a] rounded-2xl border border-white/10 flex flex-col overflow-hidden"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* banner */}
          <div className="h-24 flex-shrink-0 relative" style={{ background: 'linear-gradient(135deg,#4c1d95,#7c3aed,#a21caf)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.1) 0,rgba(255,255,255,0.1) 1px,transparent 0,transparent 50%)', backgroundSize: '12px 12px' }} />
            {/* Souk badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/30 rounded-full px-2 py-0.5">
              <span className="text-[10px] text-white/70 font-medium">🛍️ Souk</span>
            </div>
          </div>

          {/* avatar overlapping banner */}
          <div className="px-5 flex flex-col flex-1 -mt-8">
            <div className="w-16 h-16 rounded-2xl border-2 border-[#1a153a] bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-2xl font-black text-white shadow-lg mb-3">
              Z
            </div>

            {/* name + verified */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white font-bold text-lg leading-tight">Zaid Al-Hassan</h2>
              <span className="text-blue-400 text-xs">✓</span>
            </div>
            <p className="text-white/50 text-sm mb-3">Senior Logo &amp; Brand Designer</p>

            {/* stars */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= 5 ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span className="text-white/60 text-xs">5.0</span>
              <span className="text-white/30 text-xs">· 128 reviews</span>
            </div>

            {/* tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['Branding','Logo Design','Figma','Illustrator'].map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full text-purple-300"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[['128','Projects'],['3 days','Delivery'],['2','Revisions']].map(([v,l]) => (
                <div key={l} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-white font-bold text-sm">{v}</p>
                  <p className="text-white/40 text-[10px]">{l}</p>
                </div>
              ))}
            </div>

            {/* price */}
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-white/40 text-xs">Starting at</span>
              <span className="text-2xl font-black text-white">1,500</span>
              <span className="text-white/60 text-sm font-medium">SAR</span>
            </div>

            {/* CTA */}
            <motion.div
              className="mt-auto mb-4 w-full py-3 rounded-xl text-center text-sm font-bold text-white cursor-pointer select-none"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a21caf)', boxShadow: '0 0 24px rgba(139,92,246,0.45)' }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡ Negotiate with Vaultalk
            </motion.div>
          </div>
        </motion.div>

        {/* ── Right: Negotiation Room ── */}
        <motion.div
          className="flex-1 bg-[#130f2b] rounded-2xl border border-violet-500/30 overflow-hidden flex flex-col"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 bg-black/20 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span className="text-white font-semibold text-sm">Negotiation Room — Logo Design</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-violet-300"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              AI-witnessed
            </span>
          </div>

          <div className="flex-1 p-5 flex flex-col gap-3 overflow-hidden justify-end">
            {phase >= 1 && (
              <motion.div className="self-end bg-violet-600 text-white py-2.5 px-5 rounded-2xl rounded-tr-sm max-w-[75%] text-sm"
                initial={{ opacity: 0, y: 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.35 }}
              >
                I need a logo design for my new startup. Can you help?
              </motion.div>
            )}
            {phase >= 2 && (
              <motion.div className="self-start bg-[#2a2456] text-white py-2.5 px-5 rounded-2xl rounded-tl-sm max-w-[75%] text-sm"
                initial={{ opacity: 0, y: 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.35 }}
              >
                Absolutely! 1,500 SAR — delivered in 3 days with 2 revisions.
              </motion.div>
            )}
          </div>

          {/* Claude AI extraction panel */}
          {phase >= 3 && (
            <motion.div
              className="mx-5 mb-5 p-4 rounded-xl relative overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(236,72,153,0.25)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute top-3 right-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </motion.div>
              </div>
              <p className="text-pink-400 font-bold text-xs mb-3 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                Claude AI — Terms Extracted
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[['Price','1,500 SAR'],['Deadline','3 days'],['Revisions','2']].map(([k,v]) => (
                  <div key={k} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-white/40 text-[10px] mb-0.5">{k}</p>
                    <p className="text-white font-bold text-sm">{v}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.p
        className="absolute bottom-6 text-center text-white/50 text-base font-medium tracking-wide"
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
      >
        Claude AI reads every message and extracts terms automatically.
      </motion.p>
    </motion.div>
  );
}
