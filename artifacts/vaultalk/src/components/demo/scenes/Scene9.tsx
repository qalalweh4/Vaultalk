import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const tiers = [
  {
    name: "Starter",
    price: "Free",
    note: "+ 1.25% per deal",
    features: ["AI contract extraction", "StreamPay escrow", "Stream Chat", "Up to 5 rooms/mo"],
    color: "#6d28d9",
    highlight: false,
  },
  {
    name: "Pro",
    price: "35 SAR",
    note: "/ month + 1.25% per deal",
    features: ["Everything in Starter", "Clause templates library", "Priority Claude AI", "Unlimited rooms"],
    color: "#8b5cf6",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "White-label API",
    features: ["Full API access", "Custom branding", "Dedicated support", "Revenue share deal"],
    color: "#ec4899",
    highlight: false,
  },
];

export function Scene9() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1100),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-16 gap-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
      transition={{ duration: 0.7 }}
    >
      <motion.div className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-5xl font-black text-white tracking-tight">Monetization</h2>
        <p className="text-white/50 text-xl mt-2">Simple, transparent pricing</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl">
        {tiers.map((tier, i) => (
          <motion.div
            key={i}
            className={`rounded-2xl border flex flex-col overflow-hidden relative ${
              tier.highlight
                ? 'border-violet-500/60 shadow-[0_0_40px_rgba(139,92,246,0.25)]'
                : 'border-white/10'
            } bg-[#1a153a]`}
            initial={{ opacity: 0, y: 40 }}
            animate={phase > i ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            {tier.highlight && (
              <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold text-center py-1.5 tracking-widest uppercase">
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
                  <motion.li
                    key={j}
                    className="flex items-start gap-2 text-white/70 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={phase > i ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.15 + j * 0.08 }}
                  >
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: tier.color + '33', color: tier.color }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {f}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
