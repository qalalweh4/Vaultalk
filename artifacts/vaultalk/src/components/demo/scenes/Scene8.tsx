import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const segments = [
  {
    label: "Freelancers",
    sub: "Developers · Designers · Writers",
    size: "2.3M+",
    region: "GCC",
    color: "#8b5cf6",
    emoji: "🛠️",
    barW: "85%",
  },
  {
    label: "SMBs",
    sub: "Startups & small businesses",
    size: "$4.2B",
    region: "Market",
    color: "#a855f7",
    emoji: "🏪",
    barW: "65%",
  },
  {
    label: "Enterprises",
    sub: "Agencies & large corporations",
    size: "White-label",
    region: "API",
    color: "#ec4899",
    emoji: "🏢",
    barW: "45%",
  },
  {
    label: "Souk Sellers",
    sub: "Marketplace product listings",
    size: "Built-in",
    region: "Channel",
    color: "#f472b6",
    emoji: "🛒",
    barW: "55%",
  },
];

export function Scene8() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 1900),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-16 gap-8"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-5xl font-black text-white tracking-tight">Market Segments</h2>
        <p className="text-white/50 text-xl mt-2">Who we serve across the GCC and beyond</p>
      </motion.div>

      <div className="w-full max-w-4xl flex flex-col gap-4">
        {segments.map((s, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-5 bg-[#1a153a] rounded-2xl border border-white/10 px-6 py-4"
            initial={{ opacity: 0, x: -40 }}
            animate={phase > i ? { opacity: 1, x: 0 } : {}}
            transition={{ type: 'spring', bounce: 0.35 }}
          >
            <span className="text-3xl w-10 text-center">{s.emoji}</span>
            <div className="w-44 flex-shrink-0">
              <p className="text-white font-bold text-lg">{s.label}</p>
              <p className="text-white/40 text-sm">{s.sub}</p>
            </div>
            <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: s.color }}
                initial={{ width: 0 }}
                animate={phase > i ? { width: s.barW } : {}}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              />
            </div>
            <div className="text-right w-28 flex-shrink-0">
              <p className="font-bold text-white">{s.size}</p>
              <p className="text-white/40 text-xs">{s.region}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
