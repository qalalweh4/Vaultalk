import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// ─── tiny UI primitives ──────────────────────────────────────────────────────
const Shield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const Lock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
  </svg>
);
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const Sparkle = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);
const Upload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const Unlock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

// ─── browser chrome wrapper ──────────────────────────────────────────────────
function AppWindow({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ background: '#0d0a1e', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* title bar */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#1a153a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 mx-2 rounded-md px-2 py-0.5 text-[10px]" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
          vaultalk.app/room/logo-design
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: color + '22', color }}>
          {label}
        </span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── chat bubble ─────────────────────────────────────────────────────────────
function Bubble({ text, sent, avatar, name }: { text: string; sent: boolean; avatar: string; name: string }) {
  return (
    <motion.div
      className={`flex gap-2 items-end ${sent ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.3 }}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{ background: sent ? '#7c3aed' : '#1e1b4b', color: 'white' }}>
        {avatar}
      </div>
      <div>
        <p className={`text-[9px] mb-0.5 text-white/30 ${sent ? 'text-right' : ''}`}>{name}</p>
        <div className="text-[11px] text-white px-3 py-2 rounded-2xl max-w-[140px] leading-snug"
          style={{ background: sent ? '#7c3aed' : 'rgba(255,255,255,0.07)', borderRadius: sent ? '14px 14px 3px 14px' : '14px 14px 14px 3px' }}>
          {text}
        </div>
      </div>
    </motion.div>
  );
}

// ─── main scene ──────────────────────────────────────────────────────────────
export function SceneUI() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 600),   // client msg
      setTimeout(() => setPhase(2), 1500),  // freelancer reply
      setTimeout(() => setPhase(3), 2400),  // AI terms extracted
      setTimeout(() => setPhase(4), 3500),  // freelancer uploads
      setTimeout(() => setPhase(5), 4400),  // client sees locked file
      setTimeout(() => setPhase(6), 5400),  // release payment pulse
      setTimeout(() => setPhase(7), 6600),  // paying...
      setTimeout(() => setPhase(8), 7700),  // unlocked!
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-4"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 className="text-2xl font-black text-white tracking-tight"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        See it in action
      </motion.h2>

      {/* ── two app windows ── */}
      <div className="flex gap-4 w-full max-w-5xl" style={{ height: '68vh' }}>

        {/* ═══════════════ CLIENT WINDOW ═══════════════ */}
        <AppWindow label="Client" color="#60a5fa">
          {/* chat column */}
          <div className="flex flex-col flex-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            {/* room header */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[11px] text-white/60 font-medium">Logo Design Room</span>
              <span className="ml-auto flex items-center gap-1 text-[9px] text-purple-400">
                <Shield /> AI-witnessed
              </span>
            </div>
            {/* messages */}
            <div className="flex-1 flex flex-col gap-2.5 p-3 overflow-hidden justify-end">
              {phase >= 1 && <Bubble text="Hey, I need a logo for my startup 🚀" sent={true} avatar="C" name="Client" />}
              {phase >= 2 && <Bubble text="Sure! 1500 SAR, 3 days, 2 revisions included." sent={false} avatar="F" name="Zaid (Freelancer)" />}
              {phase >= 4 && <Bubble text="Files uploaded ✓ — locked until payment." sent={false} avatar="F" name="Zaid (Freelancer)" />}
              {phase >= 8 && (
                <motion.div className="flex justify-center">
                  <span className="text-[10px] px-3 py-1 rounded-full text-emerald-400 font-semibold" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                    🔓 Files unlocked — enjoy your logo!
                  </span>
                </motion.div>
              )}
            </div>
            {/* input bar */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1 rounded-lg px-3 py-1.5 text-[10px] text-white/20" style={{ background: 'rgba(255,255,255,0.05)' }}>
                Type a message…
              </div>
            </div>
          </div>

          {/* contract / deliverables sidebar */}
          <div className="w-36 flex flex-col p-2 gap-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {/* AI terms */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div className="rounded-lg p-2 flex flex-col gap-1"
                  style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <p className="flex items-center gap-1 text-[9px] font-bold text-pink-400">
                    <Sparkle /> Claude AI
                  </p>
                  <div className="grid grid-cols-2 gap-1 mt-0.5">
                    {[['Price','1500 SAR'],['Days','3'],['Revisions','2'],['Status','Agreed']].map(([k,v]) => (
                      <div key={k} className="rounded p-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-[8px] text-white/30">{k}</p>
                        <p className="text-[9px] text-white font-semibold">{v}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* deliverables */}
            <AnimatePresence>
              {phase >= 5 && (
                <motion.div className="rounded-lg p-2 flex flex-col gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-[9px] text-white/50 font-medium">Deliverables</p>
                  <motion.div
                    className="flex items-center gap-1.5 rounded-md px-2 py-1.5"
                    style={{ background: phase >= 8 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${phase >= 8 ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.2)'}` }}
                    animate={{ background: phase >= 8 ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.08)' }}
                    transition={{ duration: 0.4 }}
                  >
                    {phase >= 8 ? (
                      <span className="text-emerald-400"><Unlock /></span>
                    ) : (
                      <span className="text-red-400"><Lock size={12} /></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-white truncate">logo_final.zip</p>
                      <p className="text-[8px]" style={{ color: phase >= 8 ? '#34d399' : '#f87171' }}>
                        {phase >= 8 ? 'Unlocked ✓' : 'Locked 🔒'}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* StreamPay release button */}
            <AnimatePresence>
              {phase >= 5 && phase < 8 && (
                <motion.div className="mt-auto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <motion.button
                    className="w-full rounded-lg py-2 text-[10px] font-bold text-white flex items-center justify-center gap-1"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}
                    animate={phase === 6 ? {
                      scale: [1, 1.06, 1, 1.06, 1],
                      boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 18px rgba(99,102,241,0.7)', '0 0 4px rgba(99,102,241,0.2)', '0 0 18px rgba(99,102,241,0.7)', '0 0 4px rgba(99,102,241,0.2)'],
                    } : {}}
                    transition={{ duration: 1.0 }}
                  >
                    💳 Release via StreamPay
                  </motion.button>

                  {phase === 7 && (
                    <motion.div className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-blue-300"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <motion.div className="w-2.5 h-2.5 border border-blue-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                      Processing payment…
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* unlocked state */}
            {phase >= 8 && (
              <motion.div className="mt-auto rounded-lg py-2 px-2 flex items-center gap-1"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}>
                <span className="text-emerald-400 text-sm">✓</span>
                <div>
                  <p className="text-[9px] text-emerald-400 font-bold">Paid!</p>
                  <p className="text-[8px] text-white/40">via StreamPay</p>
                </div>
              </motion.div>
            )}
          </div>
        </AppWindow>

        {/* ═══════════════ FREELANCER WINDOW ═══════════════ */}
        <AppWindow label="Freelancer" color="#a78bfa">
          <div className="flex flex-col flex-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            {/* room header */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[11px] text-white/60 font-medium">Logo Design Room</span>
              <span className="ml-auto flex items-center gap-1 text-[9px] text-purple-400">
                <Shield /> AI-witnessed
              </span>
            </div>
            {/* messages (mirrored perspective) */}
            <div className="flex-1 flex flex-col gap-2.5 p-3 overflow-hidden justify-end">
              {phase >= 1 && <Bubble text="Hey, I need a logo for my startup 🚀" sent={false} avatar="C" name="Client" />}
              {phase >= 2 && <Bubble text="Sure! 1500 SAR, 3 days, 2 revisions included." sent={true} avatar="F" name="You" />}
              {phase >= 4 && <Bubble text="Files uploaded ✓ — locked until payment." sent={true} avatar="F" name="You" />}
              {phase >= 8 && (
                <motion.div className="flex justify-center">
                  <span className="text-[10px] px-3 py-1 rounded-full text-emerald-400 font-semibold" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                    💰 1500 SAR released to your account!
                  </span>
                </motion.div>
              )}
            </div>
            {/* input */}
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1 rounded-lg px-3 py-1.5 text-[10px] text-white/20" style={{ background: 'rgba(255,255,255,0.05)' }}>
                Type a message…
              </div>
              <motion.button
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/40"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                animate={phase === 3 ? { color: '#a78bfa', background: 'rgba(167,139,250,0.15)' } : {}}
              >
                <Upload />
              </motion.button>
            </div>
          </div>

          {/* freelancer sidebar */}
          <div className="w-36 flex flex-col p-2 gap-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {/* AI terms (same) */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div className="rounded-lg p-2 flex flex-col gap-1"
                  style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <p className="flex items-center gap-1 text-[9px] font-bold text-pink-400">
                    <Sparkle /> Claude AI
                  </p>
                  <div className="grid grid-cols-2 gap-1 mt-0.5">
                    {[['Price','1500 SAR'],['Days','3'],['Rev.','2'],['Status','Agreed']].map(([k,v]) => (
                      <div key={k} className="rounded p-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-[8px] text-white/30">{k}</p>
                        <p className="text-[9px] text-white font-semibold">{v}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* upload zone */}
            <AnimatePresence>
              {phase >= 3 && phase < 4 && (
                <motion.div
                  className="rounded-lg p-3 flex flex-col items-center gap-2"
                  style={{ border: '1.5px dashed rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.05)' }}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <span className="text-purple-400"><Upload /></span>
                  <p className="text-[9px] text-white/40 text-center">Drop deliverables here</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* uploaded + locked confirmation */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div className="rounded-lg p-2 flex flex-col gap-1.5"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.4 }}>
                  <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check /> Uploaded &amp; locked
                  </p>
                  <div className="flex items-center gap-1.5 rounded-md px-1.5 py-1"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-purple-400"><FileIcon /></span>
                    <p className="text-[9px] text-white truncate">logo_final.zip</p>
                    <span className="text-red-400 ml-auto"><Lock size={10} /></span>
                  </div>
                  <p className="text-[8px] text-white/30 text-center">Client notified</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* payment received */}
            {phase >= 8 && (
              <motion.div className="mt-auto rounded-lg p-2 flex flex-col items-center gap-1"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.55 }}>
                <p className="text-emerald-400 text-lg">💰</p>
                <p className="text-[10px] font-bold text-emerald-400">1500 SAR</p>
                <p className="text-[8px] text-white/40">Released to you</p>
              </motion.div>
            )}
          </div>
        </AppWindow>
      </div>

      {/* bottom label */}
      <motion.p className="text-white/40 text-sm font-medium text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        {phase < 5 ? 'AI reads every message and extracts contract terms automatically'
          : phase < 8 ? 'Deliverables locked until StreamPay escrow is released'
          : '✓ Both sides protected — no trust required'}
      </motion.p>
    </motion.div>
  );
}
