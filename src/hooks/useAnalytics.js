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

    const hourCounts = {};
    nonCancelledBookings.forEach((booking) => {
      const hour = getHourFromDate(booking.startTime);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        bookings: count,
      }))
      .sort((a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10));

    const resourceCounts = {};
    nonCancelledBookings.forEach((booking) => {
      resourceCounts[booking.resourceId] = (resourceCounts[booking.resourceId] || 0) + 1;
    });

    const mostUsedResources = Object.entries(resourceCounts)
      .map(([resourceId, count]) => ({
        name: getResourceName(resourceId, resourcesById),
        bookings: count,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);

    const typeCounts = { lab: 0, room: 0, equipment: 0 };
    resources.forEach((resource) => {
      typeCounts[resource.type] = (typeCounts[resource.type] || 0) + 1;
    });

    const resourceTypeDistribution = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const availabilityTrends = [];
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayKey = formatDate(date);

      const dayBookings = nonCancelledBookings.filter((booking) => (
        formatDate(booking.startTime) === dayKey
      ));

      const uniqueResourceIds = new Set(dayBookings.map((booking) => booking.resourceId));

      availabilityTrends.push({
        day: dayLabel,
        bookings: dayBookings.length,
        available: Math.max(0, resources.length - uniqueResourceIds.size),
      });
    }

    const activeBookings = bookings.filter((booking) => booking.status === 'active').length;
    const availableNow = resources.filter((resource) => resource.status === 'available').length;

    const peakEntry = peakHours.reduce(
      (highest, hourEntry) => (hourEntry.bookings > highest.bookings ? hourEntry : highest),
      { hour: 'N/A', bookings: 0 },
    );

    return {
      peakHours,
      mostUsedResources,
      availabilityTrends,
      resourceTypeDistribution,
      totalBookings: bookings.length,
      activeBookings,
      availableNow,
      peakHourLabel: peakEntry.hour,
      mostPopularResource: mostUsedResources[0]?.name ?? 'N/A',
      latestBookingTime: toDate(bookings[0]?.startTime) ?? null,
    };
  }, [bookings, resources]);
}
