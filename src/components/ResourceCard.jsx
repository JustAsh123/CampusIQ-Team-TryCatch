import { motion } from 'framer-motion';
import { Cpu, DoorOpen, FlaskConical, MapPin, Users } from 'lucide-react';
import {
  getResourceTypeLabel,
  getStatusColor,
  getStatusLabel,
} from '../utils/helpers';

const typeIcons = {
  lab: FlaskConical,
  room: DoorOpen,
  equipment: Cpu,
};

const typeColors = {
  lab: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  room: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  equipment: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
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
      className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 transition-colors duration-300"
    >
      <div className={`h-1 w-full ${resource.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${typeColors[resource.type]}`}>
            <Icon size={20} />
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(resource.status)}`}>
            {getStatusLabel(resource.status)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {resource.name}
          </h3>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-surface-600 dark:text-surface-400">
            {getResourceTypeLabel(resource.type)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-surface-500 dark:text-surface-400">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{resource.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span>Capacity {resource.capacity}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
