import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, color = 'primary', index = 0 }) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
  };

  const iconBgMap = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    accent: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative overflow-hidden bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5"
    >
      {/* Subtle gradient accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${colorMap[color]} opacity-5 rounded-bl-full`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBgMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}
