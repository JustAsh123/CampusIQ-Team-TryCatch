import { RESOURCE_TYPES } from '../utils/constants';

export default function ResourceFilters({ filters, onChange }) {
  const statusOptions = ['All', 'Available', 'Occupied', 'Maintenance'];
  const typeOptions = ['All', ...RESOURCE_TYPES];

  return (
    <div className="flex flex-wrap gap-3">
      {/* Type filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Type</span>
        <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-0.5">
          {typeOptions.map((type) => (
            <button
              key={type}
              onClick={() => onChange({ ...filters, type })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.type === type
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</span>
        <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-0.5">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onChange({ ...filters, status })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.status === status
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
