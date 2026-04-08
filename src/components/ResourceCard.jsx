import { motion } from 'framer-motion';
import { FlaskConical, DoorOpen, Cpu, MapPin, Users } from 'lucide-react';
import { getStatusColor } from '../utils/helpers';

const typeIcons = {
  Lab: FlaskConical,
  Room: DoorOpen,
  Equipment: Cpu,
};

const typeColors = {
  Lab: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  Room: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  Equipment: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
};

export default function ResourceCard({ resource, onClick, index = 0 }) {
  const Icon = typeIcons[resource.type] || Cpu;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      onClick={() => onClick?.(resource)}
      className="group cursor-pointer bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${resource.status === 'Available' ? 'bg-emerald-500' : resource.status === 'Occupied' ? 'bg-red-500' : 'bg-amber-500'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${typeColors[resource.type]}`}>
            <Icon size={20} />
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(resource.status)}`}>
            {resource.status}
          </span>
        </div>

        <h3 className="font-bold text-surface-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {resource.name}
        </h3>

        <p className="text-sm text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">
          {resource.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-surface-400 dark:text-surface-500">
          <span className="flex items-center gap-1">
            <MapPin size={13} />
            {resource.location}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {resource.capacity}
          </span>
        </div>

        {resource.features && resource.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {resource.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
