export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(date) {
  const normalizedDate = toDate(date);
  if (!normalizedDate) return 'N/A';

  return normalizedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  const normalizedDate = toDate(date);
  if (!normalizedDate) return 'N/A';

  return normalizedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date) {
  const normalizedDate = toDate(date);
  if (!normalizedDate) return 'N/A';

  return normalizedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeRange(startTime, endTime) {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function toInputDate(value = new Date()) {
  const normalizedDate = toDate(value) || new Date();
  const year = normalizedDate.getFullYear();
  const month = `${normalizedDate.getMonth() + 1}`.padStart(2, '0');
  const day = `${normalizedDate.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getToday() {
  return toInputDate(new Date());
}

export function titleCase(value) {
  if (!value) return '';
  const normalizedValue = `${value}`;
  return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
}

export function getBookingWindow(date, slot) {
  if (!date || !slot) return null;

  const [startLabel, endLabel] = slot.split(' - ');
  const [startHour, startMinute] = startLabel.split(':').map(Number);
  const [endHour, endMinute] = endLabel.split(':').map(Number);
  const [year, month, day] = date.split('-').map(Number);

  return {
    startTime: new Date(year, month - 1, day, startHour, startMinute, 0, 0),
    endTime: new Date(year, month - 1, day, endHour, endMinute, 0, 0),
  };
}

export function getDayBounds(date) {
  const [year, month, day] = date.split('-').map(Number);

  return {
    start: new Date(year, month - 1, day, 0, 0, 0, 0),
    end: new Date(year, month - 1, day, 23, 59, 59, 999),
  };
}

export function datesOverlap(startA, endA, startB, endB) {
  const normalizedStartA = toDate(startA);
  const normalizedEndA = toDate(endA);
  const normalizedStartB = toDate(startB);
  const normalizedEndB = toDate(endB);

  if (!normalizedStartA || !normalizedEndA || !normalizedStartB || !normalizedEndB) {
    return false;
  }

  return normalizedStartA < normalizedEndB && normalizedEndA > normalizedStartB;
}

export function getLiveBookingStatus(booking, now = new Date()) {
  if (!booking) return 'cancelled';
  if (booking.status === 'cancelled') return 'cancelled';
  return toDate(booking.endTime) <= now ? 'completed' : 'active';
}

export function getResourceAvailability(resource, bookings = [], now = new Date()) {
  const isOccupied = bookings.some((booking) => (
    booking.resourceId === resource.id &&
    getLiveBookingStatus(booking, now) === 'active' &&
    datesOverlap(booking.startTime, booking.endTime, now, new Date(now.getTime() + 1))
  ));

  return isOccupied ? 'occupied' : 'available';
}

export function isPastBookingSlot(startTime, endTime, now = new Date()) {
  const normalizedStart = toDate(startTime);
  const normalizedEnd = toDate(endTime);

  if (!normalizedStart || !normalizedEnd) return false;
  return normalizedStart < now && normalizedEnd <= now;
}

export function getStatusColor(status) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'occupied':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function getBookingStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function getHourFromDate(date) {
  return toDate(date)?.getHours() ?? 0;
}

export function getStatusLabel(status) {
  return titleCase(status);
}

export function getResourceTypeLabel(type) {
  return titleCase(type);
}

export function getResourceName(resourceId, resourcesById) {
  return resourcesById[resourceId]?.name || 'Unknown resource';
}

export function sortByStartTimeDesc(items) {
  return [...items].sort((a, b) => {
    const startA = toDate(a.startTime)?.getTime() ?? 0;
    const startB = toDate(b.startTime)?.getTime() ?? 0;
    return startB - startA;
  });
}

export function sortByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function getTimeSlotLabel(startTime, endTime) {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function isBookingActiveNow(booking, now = new Date()) {
  const normalizedStart = toDate(booking.startTime);
  const normalizedEnd = toDate(booking.endTime);

  return (
    booking.status !== 'cancelled' &&
    normalizedStart <= now &&
    normalizedEnd > now
  );
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
