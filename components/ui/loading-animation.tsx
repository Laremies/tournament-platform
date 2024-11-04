//created with v0.dev
'use client';
import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  const colors = ['bg-blue-950', 'bg-yellow-600', 'bg-red-500'];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative flex gap-2" role="status" aria-label="Loading">
        {colors.map((color, i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full ${color}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
