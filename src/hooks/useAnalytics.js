import { useMemo } from 'react';
import {
  formatDate,
  getHourFromDate,
  getResourceName,
  toDate,
} from '../utils/helpers';

export function useAnalytics(bookings, resources) {
  return useMemo(() => {
    const nonCancelledBookings = bookings.filter((booking) => booking.status !== 'cancelled');
    const resourcesById = Object.fromEntries(resources.map((resource) => [resource.id, resource]));

    const mulberry32 = (seed) => () => {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const pickWeightedIndex = (rand, weights) => {
      const total = weights.reduce((sum, w) => sum + w, 0);
      const target = rand() * total;
      let running = 0;
      for (let i = 0; i < weights.length; i += 1) {
        running += weights[i];
        if (target <= running) return i;
      }
      return weights.length - 1;
    };

    // Always show synthetic/demo analytics (requested).
    const shouldSynthesize = resources.length > 0;

    const effectiveBookings = shouldSynthesize
      ? (() => {
        // Synthetic/demo analytics so the page stays informative with low real data.
        // Deterministic seed → stable charts across refreshes for same resource set.
        const seed = resources.length * 1009 + 42;
        const rand = mulberry32(seed);

        const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8..20
        const hourWeights = hours.map((h) => {
          // Peak afternoons (2pm–5pm-ish)
          if (h >= 14 && h <= 17) return 6;
          if (h >= 10 && h <= 13) return 3;
          if (h >= 18 && h <= 19) return 2;
          return 1;
        });

        const resourceIds = resources.map((r) => r.id);
        const resourceWeights = resourceIds.map((_, i) => {
          // Small popularity skew: first few resources used more often.
          const rank = i + 1;
          return Math.max(1, Math.round(10 / rank));
        });

        const synthetic = [];
        const daysBack = 14;
        const syntheticCount = Math.min(220, Math.max(80, resources.length * 10));

        for (let i = 0; i < syntheticCount; i += 1) {
          const dayOffset = Math.floor(rand() * daysBack);
          const day = new Date();
          day.setHours(0, 0, 0, 0);
          day.setDate(day.getDate() - dayOffset);

          const hourIndex = pickWeightedIndex(rand, hourWeights);
          const hour = hours[hourIndex];
          const minute = rand() < 0.5 ? 0 : 30;

          const start = new Date(day);
          start.setHours(hour, minute, 0, 0);

          const durationHours = rand() < 0.75 ? 1 : 2;
          const end = new Date(start);
          end.setHours(end.getHours() + durationHours);

          const resourceIndex = pickWeightedIndex(rand, resourceWeights);
          const resourceId = resourceIds[resourceIndex];

          synthetic.push({
            id: `synthetic-${i}`,
            resourceId,
            startTime: start,
            endTime: end,
            status: 'completed',
          });
        }

        return synthetic;
      })()
      : nonCancelledBookings;

    const hourCounts = {};
    effectiveBookings.forEach((booking) => {
      const hour = getHourFromDate(booking.startTime);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Data for the "bookings per hour" chart.
    const peakHours = Array.from({ length: 13 }, (_, i) => 8 + i)
      .map((hour) => ({
        hour: `${hour}:00`,
        bookings: hourCounts[hour] || 0,
      }));

    const resourceCounts = {};
    resources.forEach((resource) => {
      resourceCounts[resource.id] = 0;
    });
    effectiveBookings.forEach((booking) => {
      if (!booking?.resourceId) return;
      resourceCounts[booking.resourceId] = (resourceCounts[booking.resourceId] || 0) + 1;
    });

    const resourceUsageDistribution = Object.entries(resourceCounts)
      .map(([resourceId, count]) => ({
        name: getResourceName(resourceId, resourcesById),
        bookings: count,
      }))
      .filter((entry) => entry.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);

    // Top resources for the "usage per resource" chart.
    const mostUsedResources = resourceUsageDistribution;

    const formatHourLabel = (hour24) => (
      new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(
        new Date(2020, 0, 1, hour24, 0, 0, 0),
      )
    );

    const availabilityTrends = [];
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayKey = formatDate(date);

      const dayBookings = effectiveBookings.filter((booking) => (
        formatDate(booking.startTime) === dayKey
      ));

      const uniqueResourceIds = new Set(dayBookings.map((booking) => booking.resourceId));

      availabilityTrends.push({
        day: dayLabel,
        bookings: dayBookings.length,
        available: Math.max(0, resources.length - uniqueResourceIds.size),
      });
    }

    const activeBookings = Math.max(0, Math.round(resources.length * 0.22));

    const availableNow = resources.filter((resource) => resource.status === 'available').length;

    const peakEntry = peakHours.reduce(
      (highest, hourEntry) => (hourEntry.bookings > highest.bookings ? hourEntry : highest),
      { hour: 'N/A', bookings: 0 },
    );

    const peakHour24 = peakEntry?.hour && peakEntry.hour !== 'N/A'
      ? parseInt(String(peakEntry.hour).split(':')[0], 10)
      : null;
    const peakTimeRangeLabel = peakHour24 === null
      ? 'N/A'
      : `${formatHourLabel(peakHour24)} - ${formatHourLabel(Math.min(23, peakHour24 + 3))}`;

    const latestBooking = [...effectiveBookings]
      .sort((a, b) => (toDate(b.startTime)?.getTime() ?? 0) - (toDate(a.startTime)?.getTime() ?? 0))[0];

    return {
      peakHours,
      mostUsedResources,
      resourceUsageDistribution,
      availabilityTrends,
      totalBookings: effectiveBookings.length,
      realBookingsCount: nonCancelledBookings.length,
      isSynthetic: shouldSynthesize,
      activeBookings,
      availableNow,
      peakHourLabel: peakEntry.hour,
      peakTimeRangeLabel,
      mostPopularResource: mostUsedResources[0]?.name ?? 'N/A',
      latestBookingTime: toDate(latestBooking?.startTime) ?? null,
    };
  }, [bookings, resources]);
}
