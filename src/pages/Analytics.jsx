import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatsCard from '../components/StatsCard';
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

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hoursRange(from, to) {
  const result = [];
  for (let h = from; h <= to; h += 1) result.push(h);
  return result;
}

function formatHourLabel(hour24) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(
    new Date(2020, 0, 1, hour24, 0, 0, 0),
  );
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date) {
  const d = startOfDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function overlapMs(aStart, aEnd, bStart, bEnd) {
  if (!overlaps(aStart, aEnd, bStart, bEnd)) return 0;
  return Math.max(0, Math.min(aEnd.getTime(), bEnd.getTime()) - Math.max(aStart.getTime(), bStart.getTime()));
}

function pickWeightedIndex(rand, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  const target = rand() * total;
  let running = 0;
  for (let i = 0; i < weights.length; i += 1) {
    running += weights[i];
    if (target <= running) return i;
  }
  return weights.length - 1;
}

function generateSyntheticBookings(resources, now) {
  // Deterministic synthetic dataset based on resources count.
  // Keeps prototype stable across refreshes.
  const rand = mulberry32(resources.length * 1009 + 4242);
  const resourceIds = resources.map((r) => r.id);

  const userCount = clamp(Math.round(8 + resources.length / 2), 8, 18);
  const indianStudentNames = [
    'Aarav Sharma',
    'Vivaan Patel',
    'Aditya Verma',
    'Arjun Singh',
    'Reyansh Gupta',
    'Ishaan Mehta',
    'Krishna Iyer',
    'Kabir Nair',
    'Siddharth Joshi',
    'Rohan Kulkarni',
    'Ananya Iyer',
    'Aditi Sharma',
    'Isha Gupta',
    'Diya Patel',
    'Priya Singh',
    'Kavya Reddy',
    'Meera Nair',
    'Sneha Kulkarni',
    'Riya Chatterjee',
    'Pooja Verma',
    'Rahul Sharma',
    'Karan Mehta',
    'Nikhil Gupta',
    'Vikram Singh',
  ];

  // Keep names deterministic and capped to `userCount`.
  const users = indianStudentNames.slice(0, userCount);

  // Popularity skew: earlier resources used more.
  const resourceWeights = resourceIds.map((_, i) => Math.max(1, Math.round(14 / (i + 1))));

  const businessHours = hoursRange(8, 20);
  const hourWeights = businessHours.map((h) => {
    // Afternoon peak
    if (h >= 14 && h <= 17) return 6;
    if (h >= 10 && h <= 13) return 3;
    if (h >= 18 && h <= 19) return 2;
    return 1;
  });

  const lookbackDays = 14;
  const syntheticCount = clamp(resources.length * 18, 120, 320);
  const result = [];

  for (let i = 0; i < syntheticCount; i += 1) {
    const dayOffset = Math.floor(rand() * lookbackDays);
    const baseDay = startOfDay(now);
    baseDay.setDate(baseDay.getDate() - dayOffset);

    const hourIndex = pickWeightedIndex(rand, hourWeights);
    const hour = businessHours[hourIndex];
    const minute = rand() < 0.55 ? 0 : 30;

    const start = new Date(baseDay);
    start.setHours(hour, minute, 0, 0);

    const durationHours = rand() < 0.78 ? 1 : 2;
    const end = new Date(start);
    end.setHours(end.getHours() + durationHours);

    const resourceIndex = pickWeightedIndex(rand, resourceWeights);
    const resourceId = resourceIds[resourceIndex];

    // Checked-in behavior: ~12% no-show overall, higher for early mornings.
    const noShowBias = hour <= 9 ? 0.18 : 0.12;
    const checkedIn = rand() > noShowBias;

    // Status: completed for past bookings, active for a few current-day bookings.
    const isToday = dayKey(start) === dayKey(now);
    const status = isToday && rand() < 0.08 ? 'active' : 'completed';

    const userId = users[Math.floor(rand() * users.length)];

    result.push({
      id: `synthetic-${i}`,
      userId,
      resourceId,
      startTime: start,
      endTime: end,
      status,
      checkedIn,
    });
  }

  // Add a few explicit “hogger” users with many bookings on same day.
  const hoggerUser = users[0];
  const hogDay = startOfDay(now);
  hogDay.setDate(hogDay.getDate() - 1);
  const hogResource = resourceIds[0] || 'unknown';
  for (let j = 0; j < 6; j += 1) {
    const start = new Date(hogDay);
    start.setHours(10 + j, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    result.push({
      id: `synthetic-hog-${j}`,
      userId: hoggerUser,
      resourceId: hogResource,
      startTime: start,
      endTime: end,
      status: 'completed',
      checkedIn: true,
    });
  }

  return result;
}

export default function Analytics() {
  // Prototype-only: always render synthetic analytics with no Firestore dependency.
  // This guarantees the page loads even if Firestore listeners fail/hang.
  const resources = useMemo(() => ([
    { id: 'demo-r1', name: 'Computer Lab A', location: 'Tech Block, Level 1' },
    { id: 'demo-r2', name: 'Computer Lab B', location: 'Tech Block, Level 1' },
    { id: 'demo-r3', name: 'AI Lab', location: 'Innovation Center, Room 203' },
    { id: 'demo-r4', name: 'Data Science Lab', location: 'Innovation Center, Room 205' },
    { id: 'demo-r5', name: 'Project Room 1', location: 'Library, Level 2' },
    { id: 'demo-r6', name: 'Project Room 2', location: 'Library, Level 2' },
    { id: 'demo-r7', name: 'Seminar Room East', location: 'Academic Block, Level 1' },
    { id: 'demo-r8', name: '3D Printer', location: 'Maker Wing, Bay 2' },
    { id: 'demo-r9', name: 'Portable Projector 1', location: 'AV Desk, Main Lobby' },
  ]), []);

  const now = useMemo(() => new Date(), []);

  const syntheticBookings = useMemo(
    () => generateSyntheticBookings(resources, now),
    [now, resources],
  );

  const analytics = useMemo(() => {
    const graceMs = 10 * 60 * 1000;
    const bookings = syntheticBookings.filter((b) => b.status !== 'cancelled');

    const resourcesById = Object.fromEntries(resources.map((r) => [r.id, r]));

    // 1) No-show detection
    const noShows = bookings.filter((b) => (
      b.checkedIn === false &&
      now.getTime() > (b.startTime?.getTime?.() ?? 0) + graceMs
    ));
    const totalNoShows = noShows.length;
    const noShowRate = bookings.length ? (totalNoShows / bookings.length) * 100 : 0;

    // 2) Utilization (last 7 days, business hours 08:00-20:00)
    const windowEnd = new Date(now);
    const windowStart = startOfDay(now);
    windowStart.setDate(windowStart.getDate() - 6); // 7 days inclusive
    const businessStartHour = 8;
    const businessEndHour = 20;
    const availableMsPerDay = (businessEndHour - businessStartHour) * 60 * 60 * 1000;
    const totalAvailableMs = availableMsPerDay * 7;

    const utilizationByResource = resources.map((resource) => {
      let bookedMs = 0;
      for (const booking of bookings) {
        if (booking.resourceId !== resource.id) continue;
        // Only count overlap inside our 7-day business-hours windows.
        for (let d = 0; d < 7; d += 1) {
          const day = new Date(windowStart);
          day.setDate(day.getDate() + d);
          const dayStart = new Date(day);
          dayStart.setHours(businessStartHour, 0, 0, 0);
          const dayEnd = new Date(day);
          dayEnd.setHours(businessEndHour, 0, 0, 0);
          bookedMs += overlapMs(booking.startTime, booking.endTime, dayStart, dayEnd);
        }
      }
      const utilizationPct = totalAvailableMs ? (bookedMs / totalAvailableMs) * 100 : 0;
      return {
        resourceId: resource.id,
        name: resource.name,
        location: resource.location,
        utilizationPct,
        bookedHours: bookedMs / (60 * 60 * 1000),
      };
    });

    const mostUtilized = [...utilizationByResource]
      .sort((a, b) => b.utilizationPct - a.utilizationPct)
      .slice(0, 3);
    const underUtilized = [...utilizationByResource]
      .sort((a, b) => a.utilizationPct - b.utilizationPct)
      .slice(0, 3);

    // 3) Peak hour analysis (0–23)
    const hourCounts = Array.from({ length: 24 }, (_, h) => ({ hour: h, bookings: 0 }));
    bookings.forEach((b) => {
      const h = b.startTime?.getHours?.();
      if (typeof h === 'number' && h >= 0 && h <= 23) {
        hourCounts[h].bookings += 1;
      }
    });
    const peakHourEntry = hourCounts.reduce(
      (best, cur) => (cur.bookings > best.bookings ? cur : best),
      { hour: 0, bookings: 0 },
    );

    // 4) Overbooking / hogging
    const bookingsPerUser = {};
    const bookingsPerUserPerDay = {};
    bookings.forEach((b) => {
      const uid = b.userId || 'unknown';
      bookingsPerUser[uid] = (bookingsPerUser[uid] || 0) + 1;
      const dk = `${uid}:${dayKey(b.startTime)}`;
      bookingsPerUserPerDay[dk] = (bookingsPerUserPerDay[dk] || 0) + 1;
    });

    const thresholdPerDay = 3;
    const hogFlags = new Set(
      Object.entries(bookingsPerUserPerDay)
        .filter(([, count]) => count > thresholdPerDay)
        .map(([key]) => key.split(':')[0]),
    );

    const topUsers = Object.entries(bookingsPerUser)
      .map(([userId, count]) => ({
        userId,
        bookings: count,
        isFlagged: hogFlags.has(userId),
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);

    // Resource usage distribution (for pie)
    const resourceCounts = {};
    bookings.forEach((b) => {
      if (!b.resourceId) return;
      resourceCounts[b.resourceId] = (resourceCounts[b.resourceId] || 0) + 1;
    });
    const resourceUsageDistribution = Object.entries(resourceCounts)
      .map(([resourceId, count]) => ({
        name: resourcesById[resourceId]?.name || 'Unknown resource',
        bookings: count,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);

    return {
      totalBookings: bookings.length,
      totalNoShows,
      noShowRate,
      mostUtilized,
      underUtilized,
      peakHour: peakHourEntry.hour,
      peakHourLabel: formatHourLabel(peakHourEntry.hour),
      bookingsPerHour: hourCounts.map((x) => ({ hour: x.hour, label: `${x.hour}:00`, bookings: x.bookings })),
      topUsers,
      thresholdPerDay,
      resourceUsageDistribution,
    };
  }, [now, resources, syntheticBookings]);

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
          Prototype analytics (synthetic) to demonstrate resource optimization insights.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={TrendingUp}
          label="Total Bookings (Synthetic)"
          value={analytics.totalBookings}
          color="primary"
          index={0}
        />
        <StatsCard
          icon={CheckCircle}
          label="No-Show Rate"
          value={`${analytics.noShowRate.toFixed(1)}%`}
          color="success"
          index={1}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Total No-Shows"
          value={analytics.totalNoShows}
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Row 1: No-shows */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            No-Show Detection
          </h3>
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-300">No-shows</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{analytics.totalNoShows}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-surface-600 dark:text-surface-300">No-show rate</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{analytics.noShowRate.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            A booking is counted as a no-show if <span className="font-semibold">checkedIn</span> is false and current time is past start time + 10 minutes grace period.
          </p>
        </motion.div>

        {/* Row 1: Peak hour */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-primary-500" />
            Peak Hour Analysis
          </h3>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-surface-600 dark:text-surface-300">
              Peak usage hour
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {analytics.peakHourLabel} ({analytics.peakHour}:00)
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.bookingsPerHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: 'var(--color-surface-500)' }}
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

        {/* Row 2: Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            Utilization (Top 3)
          </h3>
          <div className="space-y-3">
            {analytics.mostUtilized.map((item) => (
              <div key={item.resourceId} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{item.location}</p>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.utilizationPct.toFixed(1)}%</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{item.bookedHours.toFixed(1)}h booked</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-rose-500" />
            Underutilized (Bottom 3)
          </h3>
          <div className="space-y-3">
            {analytics.underUtilized.map((item) => (
              <div key={item.resourceId} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{item.location}</p>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.utilizationPct.toFixed(1)}%</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{item.bookedHours.toFixed(1)}h booked</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 3: Hogging / top users */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users size={18} className="text-accent-500" />
            Overbooking / Resource Hogging
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
            Users are flagged if they exceed <span className="font-semibold">{analytics.thresholdPerDay}</span> bookings in a single day.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.topUsers.map((user) => (
              <div
                key={user.userId}
                className={`p-4 rounded-2xl border transition-colors duration-300 ${
                  user.isFlagged
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
                    : 'bg-gray-100 dark:bg-gray-800 border-surface-200 dark:border-surface-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.userId}</p>
                  {user.isFlagged && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      flagged
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-300 mt-1">
                  {user.bookings} bookings
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bonus: Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 transition-colors duration-300"
        >
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
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
                  nameKey="name"
                >
                  {analytics.resourceUsageDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2">
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
    </PageWrapper>
  );
}
