import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Clock, Star, CheckCircle } from 'lucide-react';
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
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-surface-900 dark:text-white">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="mt-0.5">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { resources, loading: resLoading } = useResources();
  const { bookings, loading: bookLoading } = useAllBookings();
  const analytics = useAnalytics(bookings, resources);

  if (resLoading || bookLoading) return <PageWrapper><Loader text="Loading analytics..." /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
          Insights into campus resource usage and trends
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={TrendingUp} label="Total Bookings" value={analytics.totalBookings} color="primary" index={0} />
        <StatsCard icon={Clock} label="Peak Hour" value={analytics.peakHourLabel} color="warning" index={1} />
        <StatsCard icon={Star} label="Most Popular" value={analytics.mostPopularResource?.split(' ').slice(0, 2).join(' ') || 'N/A'} color="accent" index={2} />
        <StatsCard icon={CheckCircle} label="Available Now" value={`${analytics.availableNow}/${resources.length}`} color="success" index={3} />
      </div>

      {analytics.totalBookings === 0 ? (
        <div className="text-center py-16">
          <p className="text-surface-500 dark:text-surface-400">Not enough data for analytics. Generate demo data from the Dashboard first.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Peak Usage Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
          >
            <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Peak Usage Hours
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
                  <Bar
                    dataKey="bookings"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    name="Bookings"
                  />
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

          {/* Most Popular Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
          >
            <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Star size={18} className="text-primary-500" />
              Most Popular Resources
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
                  <Bar
                    dataKey="bookings"
                    fill="url(#hBarGradient)"
                    radius={[0, 6, 6, 0]}
                    name="Bookings"
                  />
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

          {/* Availability Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
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
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4 }}
                    name="Bookings"
                  />
                  <Line
                    type="monotone"
                    dataKey="available"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Available"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Resource Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
          >
            <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-purple-500" />
              Resource Type Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.resourceTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.resourceTypeDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {analytics.resourceTypeDistribution.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-surface-600 dark:text-surface-400">
                    {entry.name} ({entry.value})
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
