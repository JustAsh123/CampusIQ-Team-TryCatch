import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle, Clock, Star, TrendingUp } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatsCard from '../components/StatsCard';
import Loader from '../components/ui/Loader';
import { useResources } from '../hooks/useResources';
import { useAllBookings } from '../hooks/useBookings';
import { useAnalytics } from '../hooks/useAnalytics';
import { CHART_COLORS } from '../utils/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-surface-900 dark:text-white">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="mt-0.5">
          {entry.name || entry.payload?.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { resources, loading: resourcesLoading } = useResources();
  const { bookings, loading: bookingsLoading } = useAllBookings();
  const analytics = useAnalytics(bookings, resources);

  if (resourcesLoading || bookingsLoading) {
    return <PageWrapper><Loader text="Loading analytics..." /></PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
          Synthesized insights generated from your resource catalog.
        </p>
      </div>

      {analytics.isSynthetic && (
        <div className="mb-6 bg-gray-100 dark:bg-gray-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-4 transition-colors duration-300">
          <p className="text-sm font-semibold text-surface-900 dark:text-white">
            Showing synthesized demo analytics
          </p>
          <p className="text-xs text-surface-600 dark:text-surface-300 mt-1">
            Charts and insights below are generated from your resource catalog to keep the dashboard meaningful.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={TrendingUp}
          label={analytics.isSynthetic ? 'Total Bookings (Demo)' : 'Total Bookings'}
          value={analytics.totalBookings}
          color="primary"
          index={0}
        />
        <StatsCard
          icon={CheckCircle}
          label="Currently Active"
          value={analytics.activeBookings}
          color="success"
          index={1}
        />
        <StatsCard
          icon={Star}
          label="Most Popular"
          value={analytics.mostPopularResource}
          color="accent"
          index={2}
        />
        <StatsCard
          icon={Clock}
          label="Peak Usage Time"
          value={analytics.peakTimeRangeLabel}
          color="warning"
          index={3}
        />
      </div>

      {analytics.totalBookings > 0 && (
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-5 transition-colors duration-300">
            <p className="text-sm font-semibold text-surface-600 dark:text-surface-300">Peak time</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white mt-1">
              {`Peak time: ${analytics.peakTimeRangeLabel}`}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-5 transition-colors duration-300">
            <p className="text-sm font-semibold text-surface-600 dark:text-surface-300">Most popular</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white mt-1">
              {`Most popular: ${analytics.mostPopularResource}`}
            </p>
          </div>
        </div>
      )}

      {analytics.totalBookings === 0 ? (
        <div className="text-center py-16">
          <p className="text-surface-500 dark:text-surface-400">Create a few bookings to unlock usage analytics.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
          >
            <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Bookings per Hour
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: 'var(--color-surface-500)' }}
                    axisLine={{ stroke: 'var(--color-surface-200)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-surface-500)' }}
                    axisLine={{ stroke: 'var(--color-surface-200)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Bookings" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
          >
            <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Star size={18} className="text-primary-500" />
              Usage per Resource
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.mostUsedResources} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'var(--color-surface-500)' }}
                    axisLine={{ stroke: 'var(--color-surface-200)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 10, fill: 'var(--color-surface-500)' }}
                    axisLine={{ stroke: 'var(--color-surface-200)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="url(#hBarGradient)" radius={[0, 6, 6, 0]} name="Bookings" />
                  <defs>
                    <linearGradient id="hBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
          >
            <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Weekly Availability Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.availabilityTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'var(--color-surface-500)' }}
                    axisLine={{ stroke: 'var(--color-surface-200)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-surface-500)' }}
                    axisLine={{ stroke: 'var(--color-surface-200)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Bookings" />
                  <Line type="monotone" dataKey="available" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Available" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
          >
            <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-purple-500" />
              Resource Usage Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.resourceUsageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="bookings"
                  >
                    {analytics.resourceUsageDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {analytics.resourceUsageDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-surface-600 dark:text-surface-400">
                    {entry.name} ({entry.bookings})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
