import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = (
  <div className="absolute inset-0 pointer-events-none">
    <motion.div className="absolute w-[70vw] h-[70vw] rounded-full opacity-25 blur-3xl"
      style={{ background: "radial-gradient(circle,#8b5cf6,transparent)", top: "-20%", left: "-10%" }}
      animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
    <motion.div className="absolute w-[50vw] h-[50vw] rounded-full opacity-15 blur-3xl"
      style={{ background: "radial-gradient(circle,#ec4899,transparent)", bottom: "-10%", right: "0%" }}
      animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
  </div>
);

function Slide1() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.6)]"
        style={{ background: "linear-gradient(135deg,#7c3aed,#a21caf)" }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div>
        <h1 className="text-7xl font-black text-white tracking-tight leading-none mb-4">
          Vault<span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">alk</span>
        </h1>
        <p className="text-2xl text-white/60 font-medium max-w-xl mx-auto leading-relaxed">
          AI-Witnessed Freelance Contract Negotiation<br />
          <span className="text-violet-400">Powered by StreamPay · Stream Chat · Claude AI</span>
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        {["StreamPay Escrow", "Claude AI", "Stream Chat"].map(tag => (
          <span key={tag} className="px-4 py-1.5 rounded-full text-sm font-medium text-violet-300"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
            {tag}
          </span>
        ))}
      </div>
      <p className="text-white/25 text-sm mt-8 tracking-widest uppercase">Streamathon Hackathon · StreamPay.sa</p>
    </div>
  );
}

function Slide2() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 text-center">
      <div className="w-24 h-24 flex items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          <path d="M2 2l20 20" stroke="#ef4444" strokeWidth="2"/>
        </svg>
      </div>
      <div>
        <h2 className="text-6xl font-black text-white tracking-tight mb-6">The Problem</h2>
        <div className="flex flex-col gap-3 items-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <span className="text-2xl">😤</span>
            <span className="text-2xl font-semibold text-red-400">Freelancers lose money — no payment protection</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.25)" }}>
            <span className="text-2xl">😩</span>
            <span className="text-2xl font-semibold text-orange-400">Clients get nothing — no verified deliverables</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <span className="text-2xl">⚖️</span>
            <span className="text-2xl font-semibold text-red-300">Disputes drag on — no neutral witness</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide3() {
  return (
    <div className="flex h-full items-center justify-center gap-8 px-16">
      {/* Souk card */}
      <div className="w-64 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden" style={{ background: "#1a153a", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="h-20 relative" style={{ background: "linear-gradient(135deg,#4c1d95,#7c3aed,#a21caf)" }}>
          <span className="absolute top-2 left-3 text-[10px] text-white/60 bg-black/30 rounded-full px-2 py-0.5">🛍️ Souk</span>
        </div>
        <div className="px-5 flex flex-col -mt-7">
          <div className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black text-white shadow-lg mb-2"
            style={{ borderColor: "#1a153a", background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}>Z</div>
          <p className="text-white font-bold text-base">Zaid Al-Hassan <span className="text-blue-400 text-xs">✓</span></p>
          <p className="text-white/40 text-xs mb-2">Senior Logo &amp; Brand Designer</p>
          <div className="flex items-center gap-1 mb-2">
            {"★★★★★".split("").map((s, i) => <span key={i} className="text-amber-400 text-xs">{s}</span>)}
            <span className="text-white/40 text-xs ml-1">5.0 · 128 reviews</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {["Branding","Logo","Figma"].map(t => (
              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full text-purple-300"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>{t}</span>
            ))}
          </div>
          <p className="text-white font-black text-xl mb-3">1,500 <span className="text-sm font-medium text-white/50">SAR</span></p>
          <div className="mb-4 w-full py-2.5 rounded-xl text-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a21caf)" }}>
            ⚡ Negotiate with Vaultalk
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
          <path d="M0 12h56M48 4l16 8-16 8" stroke="rgba(139,92,246,0.7)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="text-violet-400 text-xs font-medium">One click</span>
      </div>

      {/* Negotiation room */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ background: "#130f2b", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          <span className="text-white font-semibold text-sm">Negotiation Room — AI-witnessed</span>
        </div>
        <div className="flex-1 p-5 flex flex-col gap-3 justify-end">
          <div className="self-end bg-violet-600 text-white py-2.5 px-5 rounded-2xl rounded-tr-sm max-w-[75%] text-sm">
            I need a logo for my new startup. Can you help?
          </div>
          <div className="self-start text-white py-2.5 px-5 rounded-2xl rounded-tl-sm max-w-[75%] text-sm"
            style={{ background: "#2a2456" }}>
            Absolutely! 1,500 SAR, delivered in 3 days with 2 revisions.
          </div>
        </div>
        <div className="mx-5 mb-5 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(236,72,153,0.25)" }}>
          <p className="text-pink-400 font-bold text-xs mb-2">✦ Claude AI — Terms Extracted</p>
          <div className="grid grid-cols-3 gap-2">
            {[["Price","1,500 SAR"],["Deadline","3 days"],["Revisions","2"]].map(([k,v]) => (
              <div key={k} className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-white/40 text-[10px]">{k}</p>
                <p className="text-white font-bold text-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide4() {
  return (
    <div className="flex h-full items-center justify-center px-16 gap-6">
      {/* Client window */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0f0c24", border: "1px solid rgba(139,92,246,0.25)" }}>
        <div className="px-4 py-2 flex items-center gap-2 text-xs text-white/40" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
          <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/></div>
          <span className="ml-2 font-medium">👤 Client View</span>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2.5">
          {[
            { from: "me", msg: "I need a logo for my startup." },
            { from: "other", msg: "Perfect! 1,500 SAR in 3 days." },
            { from: "me", msg: "Sounds good. What file formats?" },
            { from: "other", msg: "SVG, PNG, PDF — all included." },
          ].map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] text-white ${m.from === "me" ? "bg-violet-600 rounded-tr-sm" : "rounded-tl-sm"}`}
                style={m.from !== "me" ? { background: "#2a2456" } : {}}>
                {m.msg}
              </div>
            </div>
          ))}
          <div className="mt-auto px-3 py-2 rounded-xl text-sm text-white/30 flex items-center gap-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Type a message...
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className="h-32 w-px" style={{ background: "linear-gradient(to bottom,transparent,rgba(139,92,246,0.4),transparent)" }}/>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div className="h-32 w-px" style={{ background: "linear-gradient(to bottom,rgba(139,92,246,0.4),transparent)" }}/>
      </div>

      {/* Freelancer window */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0f0c24", border: "1px solid rgba(236,72,153,0.25)" }}>
        <div className="px-4 py-2 flex items-center gap-2 text-xs text-white/40" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
          <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/></div>
          <span className="ml-2 font-medium">🛠️ Freelancer View</span>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2.5">
          {[
            { from: "other", msg: "I need a logo for my startup." },
            { from: "me", msg: "Perfect! 1,500 SAR in 3 days." },
            { from: "other", msg: "Sounds good. What file formats?" },
            { from: "me", msg: "SVG, PNG, PDF — all included." },
          ].map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] text-white ${m.from === "me" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                style={m.from === "me" ? { background: "#2a2456" } : { background: "#6d28d9" }}>
                {m.msg}
              </div>
            </div>
          ))}
          <div className="mt-auto flex gap-2 items-center">
            <div className="flex-1 px-3 py-2 rounded-xl text-sm text-white/30 flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Type a message...
            </div>
            <div className="px-3 py-2 rounded-xl text-xs font-bold text-white/60 flex items-center gap-1"
              style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.25)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              Upload
            </div>
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <span className="text-white/30 text-sm font-medium">Powered by Stream Chat · AI-Witnessed by Claude</span>
      </div>
    </div>
  );
}

function Slide5() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-16">
      <div>
        <h2 className="text-6xl font-black text-white tracking-tight mb-3">Highly Encrypted Files</h2>
        <p className="text-2xl text-white/50 mb-8">Before the client can access anything</p>
      </div>
      <div className="flex items-center gap-6 w-full max-w-4xl">
        {/* Freelancer uploads */}
        <div className="flex-1 rounded-2xl p-6" style={{ background: "#1a153a", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-4">Freelancer uploads</p>
          <div className="flex flex-col gap-2">
            {["logo_final.ai","logo_final.svg","brand_guide.pdf"].map(f => (
              <div key={f} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6d7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
                </svg>
                <span className="text-white/60 text-sm font-mono">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Encryption */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
            <path d="M0 12h40M32 4l16 8-16 8" stroke="rgba(239,68,68,0.6)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-400"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
            AES-256
          </div>
        </div>

        {/* Locked on server */}
        <div className="flex-1 rounded-2xl p-6" style={{ background: "#1a153a", border: "1px solid rgba(239,68,68,0.25)" }}>
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-4">Stored — encrypted</p>
          <div className="flex flex-col gap-2">
            {["logo_final.ai.enc","logo_final.svg.enc","brand_guide.pdf.enc"].map(f => (
              <div key={f} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.06)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="text-red-400/70 text-sm font-mono">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-white/30 text-lg">Client sees a lock icon — nothing is accessible until payment is released</p>
    </div>
  );
}

function Slide6() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-16">
      <div className="text-center">
        <h2 className="text-6xl font-black text-white tracking-tight mb-3">
          The Key is the{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Invoice ID</span>
        </h2>
        <p className="text-white/50 text-xl">StreamPay only releases it when payment succeeds</p>
      </div>

      <div className="flex items-center gap-4 w-full max-w-5xl">
        {/* Encrypted file */}
        <div className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: "#1a153a", border: "1px solid rgba(255,255,255,0.1)" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p className="text-white font-bold">Encrypted File</p>
          <div className="px-3 py-1 rounded-full text-xs text-red-400" style={{ background: "rgba(239,68,68,0.12)" }}>AES-256</div>
          <p className="text-white/30 text-xs text-center">Unreadable without the key</p>
        </div>

        <svg width="60" height="20" viewBox="0 0 60 20" fill="none"><path d="M0 10h52M44 3l16 7-16 7" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" strokeLinecap="round"/></svg>

        {/* StreamPay */}
        <div className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: "#1e3a5f", border: "1px solid rgba(59,130,246,0.4)" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <p className="text-white font-bold">StreamPay API</p>
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="text-white/30 text-xs text-center">Webhook fires on payment success</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <svg width="60" height="20" viewBox="0 0 60 20" fill="none"><path d="M0 10h52M44 3l16 7-16 7" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <div className="px-2 py-1 rounded-md text-[10px] font-mono text-emerald-400 text-center"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}>
            invoice_id:<br/><span className="text-white/50">sp_4f8a2c...</span>
          </div>
        </div>

        {/* Unlocked */}
        <div className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: "#064e3b", border: "1px solid rgba(52,211,153,0.4)" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
          </svg>
          <p className="text-emerald-400 font-bold">File Unlocked</p>
          <div className="px-3 py-1 rounded-full text-xs text-emerald-400" style={{ background: "rgba(52,211,153,0.12)" }}>✓ Decrypted</div>
          <p className="text-white/30 text-xs text-center">Client can now download</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <span className="text-xl">🔑</span>
        <p className="text-white/70 text-base">
          <span className="text-white font-semibold">Invoice ID = AES decryption key</span>
          {" "}— not even Vaultalk holds the key until StreamPay confirms payment
        </p>
      </div>
    </div>
  );
}

function Slide7() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 text-center">
      <div>
        <h2 className="text-6xl font-black text-white tracking-tight mb-4">
          No disputes. No chasing.<br />
          <span className="text-emerald-400">Just trust.</span>
        </h2>
        <p className="text-white/40 text-xl">Every deal has an AI-witnessed contract on record</p>
      </div>
      <div className="flex gap-6 w-full max-w-4xl justify-center">
        {[
          { emoji: "✅", label: "Client", sub: "Files Delivered", color: "#10b981" },
          { emoji: "📄", label: "AI-Witnessed Contract", sub: "Claude AI on record", color: "#8b5cf6" },
          { emoji: "💰", label: "Freelancer", sub: "Payment Released", color: "#10b981" },
        ].map(({ emoji, label, sub, color }) => (
          <div key={label} className="flex-1 rounded-2xl p-6 flex flex-col items-center gap-3"
            style={{ background: "#1a153a", border: `1px solid ${color}44` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: `${color}22` }}>{emoji}</div>
            <p className="text-white font-bold text-lg">{label}</p>
            <p style={{ color }} className="font-medium text-sm">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide8() {
  const pillars = [
    { icon: "💸", title: "Transaction Fee", desc: "1.25% per escrowed deal", color: "#8b5cf6" },
    { icon: "⭐", title: "Premium Plans", desc: "AI clause templates & priority support", color: "#a855f7" },
    { icon: "🏢", title: "Enterprise API", desc: "White-label for platforms", color: "#ec4899" },
    { icon: "🤝", title: "StreamPay Rev-Share", desc: "Revenue split on every escrow", color: "#f472b6" },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-10 px-16">
      <div className="text-center">
        <h2 className="text-6xl font-black text-white tracking-tight">Business Model</h2>
        <p className="text-white/50 text-xl mt-2">Four revenue streams from day one</p>
      </div>
      <div className="grid grid-cols-4 gap-5 w-full max-w-5xl">
        {pillars.map((p, i) => (
          <div key={i} className="rounded-2xl border border-white/10 p-6 flex flex-col gap-3 relative overflow-hidden"
            style={{ background: "#1a153a" }}>
            <div className="absolute inset-0 rounded-2xl opacity-15" style={{ background: `radial-gradient(circle at 30% 30%,${p.color},transparent 70%)` }} />
            <span className="text-4xl">{p.icon}</span>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{p.title}</p>
              <p className="text-white/50 text-sm mt-1">{p.desc}</p>
            </div>
            <div className="mt-auto h-0.5 rounded-full" style={{ background: p.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide9() {
  const segments = [
    { label: "Freelancers", sub: "Developers · Designers · Writers", size: "2.3M+", region: "GCC", color: "#8b5cf6", emoji: "🛠️", barW: "85%" },
    { label: "SMBs", sub: "Startups & small businesses", size: "$4.2B", region: "Market", color: "#a855f7", emoji: "🏪", barW: "65%" },
    { label: "Enterprises", sub: "Agencies & large corporations", size: "White-label", region: "API", color: "#ec4899", emoji: "🏢", barW: "45%" },
    { label: "Souk Sellers", sub: "Marketplace product listings", size: "Built-in", region: "Channel", color: "#f472b6", emoji: "🛒", barW: "55%" },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-16">
      <div className="text-center">
        <h2 className="text-6xl font-black text-white tracking-tight">Market Segments</h2>
        <p className="text-white/50 text-xl mt-2">Who we serve across the GCC and beyond</p>
      </div>
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-5 rounded-2xl border border-white/10 px-6 py-4"
            style={{ background: "#1a153a" }}>
            <span className="text-3xl w-10 text-center">{s.emoji}</span>
            <div className="w-44 flex-shrink-0">
              <p className="text-white font-bold text-lg">{s.label}</p>
              <p className="text-white/40 text-sm">{s.sub}</p>
            </div>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full" style={{ background: s.color, width: s.barW }} />
            </div>
            <div className="text-right w-28 flex-shrink-0">
              <p className="font-bold text-white">{s.size}</p>
              <p className="text-white/40 text-xs">{s.region}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide10() {
  const tiers = [
    {
      name: "Starter", price: "Free", note: "+ 1.25% per deal",
      features: ["AI contract extraction", "StreamPay escrow", "Stream Chat", "Up to 5 rooms/mo"],
      color: "#6d28d9", highlight: false,
    },
    {
      name: "Pro", price: "35 SAR", note: "/ month + 0.75% per deal",
      features: ["Everything in Starter", "Clause templates library", "Priority Claude AI", "Unlimited rooms"],
      color: "#8b5cf6", highlight: true,
    },
    {
      name: "Enterprise", price: "Custom", note: "White-label API",
      features: ["Full API access", "Custom branding", "Dedicated support", "Revenue share deal"],
      color: "#ec4899", highlight: false,
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-16">
      <div className="text-center">
        <h2 className="text-6xl font-black text-white tracking-tight">Monetization</h2>
        <p className="text-white/50 text-xl mt-2">Simple, transparent pricing</p>
      </div>
      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl">
        {tiers.map((tier, i) => (
          <div key={i} className={`rounded-2xl border flex flex-col overflow-hidden ${
            tier.highlight ? "shadow-[0_0_40px_rgba(139,92,246,0.25)]" : ""}`}
            style={{ background: "#1a153a", borderColor: tier.highlight ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.1)" }}>
            {tier.highlight && (
              <div className="text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase"
                style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}>
                Most Popular
              </div>
            )}
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div>
                <p className="text-white/60 text-sm font-medium uppercase tracking-widest">{tier.name}</p>
                <p className="text-4xl font-black text-white mt-1">{tier.price}</p>
                <p className="text-white/40 text-sm">{tier.note}</p>
              </div>
              <div className="h-px bg-white/5" />
              <ul className="flex flex-col gap-2.5 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-white/70 text-sm">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: tier.color + "33", color: tier.color }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide11() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.6)]"
        style={{ background: "linear-gradient(135deg,#7c3aed,#a21caf)" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div>
        <h2 className="text-7xl font-black text-white tracking-tight mb-4">
          Built for the<br />
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            new economy
          </span>
        </h2>
        <p className="text-2xl text-white/50 max-w-2xl mx-auto">
          Trust between freelancers and clients — enforced by AI, secured by StreamPay, delivered through Stream Chat.
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        {["🛡️ StreamPay Escrow", "🤖 Claude AI Witness", "💬 Stream Chat", "🔑 AES-256 Encryption"].map(t => (
          <span key={t} className="px-4 py-2 rounded-full text-sm font-medium text-white/70"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>{t}</span>
        ))}
      </div>
      <p className="text-white/20 text-sm tracking-widest uppercase mt-6">Thank you · Streamathon 2026</p>
    </div>
  );
}

const SLIDES = [
  { component: Slide1, label: "Vaultalk" },
  { component: Slide2, label: "The Problem" },
  { component: Slide3, label: "The Solution" },
  { component: Slide4, label: "Client-Freelancer Chat" },
  { component: Slide5, label: "Encrypted Files" },
  { component: Slide6, label: "Invoice ID Key" },
  { component: Slide7, label: "Trust" },
  { component: Slide8, label: "Business Model" },
  { component: Slide9, label: "Market Segments" },
  { component: Slide10, label: "Monetization" },
  { component: Slide11, label: "Thank You" },
];

export default function PitchPage() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((next: number) => {
    if (next < 0 || next >= SLIDES.length) return;
    setDir(next > current ? 1 : -1);
    setCurrent(next);
  }, [current]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") go(current + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(current - 1);
      if (e.key === "f" || e.key === "F") document.documentElement.requestFullscreen?.();
      if (e.key === "Escape") document.exitFullscreen?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, go]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
  };

  const CurrentSlide = SLIDES[current].component;

  return (
    <div className="fixed inset-0 bg-[#0d0a1e] select-none overflow-hidden" onClick={() => go(current + 1)}>
      {BG}

      <AnimatePresence custom={dir} mode="wait">
        <motion.div
          key={current}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        >
          <CurrentSlide />
        </motion.div>
      </AnimatePresence>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-4 z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
        onClick={e => e.stopPropagation()}>

        {/* Slide label + counter */}
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm font-medium">{SLIDES[current].label}</span>
          <span className="text-white/20 text-xs">{current + 1} / {SLIDES.length}</span>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                background: i === current ? "#8b5cf6" : "rgba(255,255,255,0.2)"
              }} />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => go(current - 1)} disabled={current === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-20"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => go(current + 1)} disabled={current === SLIDES.length - 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-20"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button onClick={() => document.documentElement.requestFullscreen?.()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all ml-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
            title="Fullscreen (F)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      {current === 0 && (
        <motion.div className="absolute top-6 right-8 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          exit={{ opacity: 0 }}>
          <span className="text-white/30 text-xs">Click or</span>
          <kbd className="text-white/40 text-xs font-mono px-1 py-0.5 rounded bg-white/10">→</kbd>
          <span className="text-white/30 text-xs">to advance</span>
        </motion.div>
      )}
    </div>
  );
}
