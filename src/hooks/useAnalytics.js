import { useMemo } from 'react';
import { getHourFromSlot } from '../utils/helpers';

export function useAnalytics(bookings, resources) {
  const analytics = useMemo(() => {
    if (!bookings.length) {
      return {
        peakHours: [],
        mostUsedResources: [],
        availabilityTrends: [],
        resourceTypeDistribution: [],
        totalBookings: 0,
        activeBookings: 0,
        availableNow: 0,
        peakHourLabel: 'N/A',
        mostPopularResource: 'N/A',
      };
    }

    // Peak hours - count bookings per hour
    const hourCounts = {};
    bookings.forEach((b) => {
      if (b.status === 'Cancelled') return;
      const hour = getHourFromSlot(b.timeSlot);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        bookings: count,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    // Most used resources
    const resourceCounts = {};
    bookings.forEach((b) => {
      if (b.status === 'Cancelled') return;
      resourceCounts[b.resourceName] = (resourceCounts[b.resourceName] || 0) + 1;
    });

    const mostUsedResources = Object.entries(resourceCounts)
      .map(([name, count]) => ({ name, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);

    // Resource type distribution
    const typeCounts = { Lab: 0, Room: 0, Equipment: 0 };
    resources.forEach((r) => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    });

    const resourceTypeDistribution = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Availability trends (last 7 days)
    const availabilityTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayBookings = bookings.filter(
        (b) => b.date === dateStr && b.status !== 'Cancelled'
      ).length;

      availabilityTrends.push({
        day: dayLabel,
        bookings: dayBookings,
        available: Math.max(0, resources.length - dayBookings),
      });
    }

    // Summary stats
    const activeBookings = bookings.filter((b) => b.status === 'Confirmed').length;
    const availableNow = resources.filter((r) => r.status === 'Available').length;

    const peakEntry = peakHours.reduce(
      (max, h) => (h.bookings > max.bookings ? h : max),
      { hour: 'N/A', bookings: 0 }
    );

    const mostPopularResource = mostUsedResources.length > 0 ? mostUsedResources[0].name : 'N/A';

    return {
      peakHours,
      mostUsedResources,
      availabilityTrends,
      resourceTypeDistribution,
      totalBookings: bookings.length,
      activeBookings,
      availableNow,
      peakHourLabel: peakEntry.hour,
      mostPopularResource,
    };
  }, [bookings, resources]);

  return analytics;
}
