import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import ResourceCard from '../components/ResourceCard';
import ResourceFilters from '../components/ResourceFilters';
import BookingModal from '../components/BookingModal';
import Loader from '../components/ui/Loader';
import { useResources } from '../hooks/useResources';

export default function Resources() {
  const { resources, loading, refetch } = useResources();
  const [selectedResource, setSelectedResource] = useState(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ type: 'All', status: 'All' });

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()) ||
        r.location?.toLowerCase().includes(search.toLowerCase());
      const matchType = filters.type === 'All' || r.type === filters.type;
      const matchStatus = filters.status === 'All' || r.status === filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }, [resources, search, filters]);

  if (loading) return <PageWrapper><Loader text="Loading resources..." /></PageWrapper>;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Resources</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Browse and book campus resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="input-field pl-10 py-2"
              id="resource-search"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${
              showFilters
                ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400'
                : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
            }`}
            id="toggle-filters-btn"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <ResourceFilters filters={filters} onChange={setFilters} />
        </motion.div>
      )}

      {/* Results count */}
      <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
        Showing {filtered.length} of {resources.length} resources
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <ResourceCard
              key={r.id}
              resource={r}
              index={i}
              onClick={setSelectedResource}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-surface-500 dark:text-surface-400">No resources match your filters</p>
        </div>
      )}

      <BookingModal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
        onBooked={refetch}
      />
    </PageWrapper>
  );
}
