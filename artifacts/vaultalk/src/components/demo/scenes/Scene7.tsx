import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const pillars = [
  { icon: "💸", title: "Transaction Fee", desc: "1.25% per escrowed deal", color: "#8b5cf6" },
  { icon: "⭐", title: "Premium Plans", desc: "AI clause templates & priority support", color: "#a855f7" },
  { icon: "🏢", title: "Enterprise API", desc: "White-label for platforms", color: "#ec4899" },
  { icon: "🤝", title: "StreamPay Rev-Share", desc: "Revenue split on every escrow", color: "#f472b6" },
];

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = pillars.map((_, i) => setTimeout(() => setPhase(i + 1), 600 + i * 700));
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-16 gap-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-5xl font-black text-white tracking-tight">Business Model</h2>
        <p className="text-white/50 text-xl mt-2">Four revenue streams from day one</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-5 w-full max-w-5xl">
        {pillars.map((p, i) => (
          <motion.div
            key={i}
            className="bg-[#1a153a] rounded-2xl border border-white/10 p-6 flex flex-col gap-3 relative overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={phase > i ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <motion.div
              className="absolute inset-0 opacity-10 rounded-2xl"
              style={{ background: `radial-gradient(circle at 30% 30%, ${p.color}, transparent 70%)` }}
              animate={phase > i ? { opacity: 0.15 } : { opacity: 0 }}
            />
            <span className="text-4xl">{p.icon}</span>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{p.title}</p>
              <p className="text-white/50 text-sm mt-1">{p.desc}</p>
            </div>
            {phase > i && (
              <motion.div
                className="mt-auto h-0.5 rounded-full"
                style={{ background: p.color }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
