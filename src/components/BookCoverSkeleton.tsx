import { motion } from 'framer-motion';

export function BookCoverSkeleton() {
  return (
    <div className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
        }}
      />
    </div>
  );
}