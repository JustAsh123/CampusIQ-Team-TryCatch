import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle,
  CalendarCheck,
  Clock,
  ArrowRight,
  Database,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatsCard from '../components/StatsCard';
import ResourceCard from '../components/ResourceCard';
import BookingModal from '../components/BookingModal';
import { useResources } from '../hooks/useResources';
import { useAllBookings } from '../hooks/useBookings';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../context/AuthContext';
import { seedDatabase } from '../services/seedService';
import { formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const { resources, loading: resLoading, refetch: refetchResources } = useResources();
  const { bookings, loading: bookLoading, refetch: refetchBookings } = useAllBookings();
  const analytics = useAnalytics(bookings, resources);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await seedDatabase((msg) => setSeedStatus(msg));
      await refetchResources();
      await refetchBookings();
      setTimeout(() => setSeedStatus(''), 3000);
    } catch {
      setSeedStatus('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const recentBookings = bookings
    .filter((b) => b.status === 'Confirmed')
    .slice(0, 5);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.displayName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Here's what's happening with your campus resources today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-secondary text-sm"
            id="seed-data-btn"
          >
            {seeding ? (
              <>
                <Loader2 className="animate-spin" size={15} />
                {seedStatus || 'Seeding...'}
              </>
            ) : (
              <>
                <Database size={15} />
                {resources.length > 0 ? 'Reseed Data' : 'Generate Demo Data'}
              </>
            )}
          </button>
        </div>
      </div>

      {seedStatus && !seeding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-800"
        >
          {seedStatus}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Building2}
          label="Total Resources"
          value={resources.length}
          color="primary"
          index={0}
        />
        <StatsCard
          icon={CheckCircle}
          label="Available Now"
          value={analytics.availableNow}
          color="success"
          index={1}
        />
        <StatsCard
          icon={CalendarCheck}
          label="Active Bookings"
          value={analytics.activeBookings}
          color="accent"
          index={2}
        />
        <StatsCard
          icon={Clock}
          label="Peak Hour"
          value={analytics.peakHourLabel}
          color="warning"
          index={3}
        />
      </div>

      {/* Quick insights */}
      {resources.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-500" />
                Quick Insights
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                <span className="text-sm text-surface-600 dark:text-surface-400">Most Popular</span>
                <span className="text-sm font-semibold text-surface-900 dark:text-white">{analytics.mostPopularResource}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                <span className="text-sm text-surface-600 dark:text-surface-400">Peak Hour</span>
                <span className="text-sm font-semibold text-surface-900 dark:text-white">{analytics.peakHourLabel}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                <span className="text-sm text-surface-600 dark:text-surface-400">Total Bookings</span>
                <span className="text-sm font-semibold text-surface-900 dark:text-white">{analytics.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                <span className="text-sm text-surface-600 dark:text-surface-400">Available Resources</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{analytics.availableNow} / {resources.length}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900 dark:text-white flex items-center gap-2">
                <CalendarCheck size={18} className="text-accent-500" />
                Recent Bookings
              </h3>
              <Link to="/bookings" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {recentBookings.length > 0 ? (
              <div className="space-y-2.5">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{b.resourceName}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">{b.userName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-surface-700 dark:text-surface-300">{formatDate(b.date)}</p>
                      <p className="text-xs text-surface-400">{b.timeSlot}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-6">No recent bookings</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Quick access resources */}
      {resources.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-surface-900 dark:text-white">Available Resources</h3>
            <Link to="/resources" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources
              .filter((r) => r.status === 'Available')
              .slice(0, 6)
              .map((r, i) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  index={i}
                  onClick={setSelectedResource}
                />
              ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!resLoading && resources.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <Database size={32} className="text-surface-400" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">No data yet</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-sm mx-auto">
            Click "Generate Demo Data" to populate the database with realistic campus resources and bookings.
          </p>
          <button onClick={handleSeed} disabled={seeding} className="btn-primary">
            <Database size={16} />
            Generate Demo Data
          </button>
        </motion.div>
      )}

      <BookingModal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        resource={selectedResource}
        onBooked={() => {
          refetchResources();
          refetchBookings();
        }}
      />
    </PageWrapper>
  );
}
