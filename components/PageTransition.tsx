'use client';
import {motion} from 'framer-motion';

export default function PageTransition({children}: {children: React.ReactNode}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1}}
    >
      {children}
    </motion.div>
  );
}
