import { motion } from 'framer-motion';

export function Scene6() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="w-48 h-48 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-[0_0_100px_rgba(139,92,246,0.5)] mb-12"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
      </motion.div>

      <motion.h1 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500 text-6xl font-black mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Negotiate. Deliver. Get Paid.
      </motion.h1>

      <motion.p className="text-white/50 text-xl font-medium tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Powered by Claude AI · StreamPay · Stream Chat
      </motion.p>
    </motion.div>
  );
}