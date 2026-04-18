import { motion } from 'framer-motion';

export function Scene1() {
  const text = "AI-Witnessed Contract Negotiation".split(" ");

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-40 h-40 mb-8">
        {/* Shield Icon Animation */}
        <motion.svg viewBox="0 0 120 120" className="w-full h-full" initial="hidden" animate="visible">
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <motion.rect x="8" y="8" width="104" height="104" rx="24" fill="url(#shieldGrad)" 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          />
          <motion.path 
            d="M60 28 L84 38 L84 60 C84 74 72 84 60 88 C48 84 36 74 36 60 L36 38 Z"
            fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, delay: 0.5, ease: "easeInOut" } }
            }}
          />
          <motion.polyline 
            points="50,60 57,67 72,52"
            fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 0.5, delay: 1.5, ease: "easeOut" } }
            }}
          />
        </motion.svg>
      </div>

      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500 text-7xl font-extrabold tracking-tight flex">
        {"Vaultalk".split('').map((char, i) => (
          <motion.span key={i}
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 1.8 + i * 0.05 }}
          >
            {char}
          </motion.span>
        ))}
      </h1>

      <div className="mt-6 flex space-x-2">
        {text.map((word, i) => (
          <motion.span key={i} className="text-white/80 text-2xl font-medium tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.5 + i * 0.1 }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}