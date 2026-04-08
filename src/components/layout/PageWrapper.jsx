import { motion } from 'framer-motion';
import Navbar from './Navbar';

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
