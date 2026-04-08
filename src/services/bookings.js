import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  datesOverlap,
  getDayBounds,
  sortByStartTimeDesc,
  toDate,
} from '../utils/helpers';

const BOOKINGS_COLLECTION = 'bookings';
const RESOURCES_COLLECTION = 'resources';

function normalizeBooking(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    userId: data.userId,
    resourceId: data.resourceId,
    startTime: toDate(data.startTime),
    endTime: toDate(data.endTime),
    status: data.status ?? 'active',
    createdAt: toDate(data.createdAt),
  };
}

function buildBookingsQuery(filters = {}) {
  const constraints = [];

  if (filters.userId) {
    constraints.push(where('userId', '==', filters.userId));
  }

  if (filters.resourceId) {
    constraints.push(where('resourceId', '==', filters.resourceId));
  }

  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }

  return constraints.length
    ? query(collection(db, BOOKINGS_COLLECTION), ...constraints)
    : collection(db, BOOKINGS_COLLECTION);
}

function applyBookingFilters(bookings, filters = {}) {
  const filteredBookings = bookings.filter((booking) => {
    if (filters.userId && booking.userId !== filters.userId) return false;
    if (filters.resourceId && booking.resourceId !== filters.resourceId) return false;
    if (filters.status && booking.status !== filters.status) return false;

    if (filters.dayStart && filters.dayEnd) {
      return datesOverlap(booking.startTime, booking.endTime, filters.dayStart, filters.dayEnd);
    }

    return true;
  });

  return sortByStartTimeDesc(filteredBookings);
}

async function reconcileResourceStatuses(resourceIds = null, now = new Date()) {
  const [resourcesSnapshot, activeBookingsSnapshot] = await Promise.all([
    getDocs(collection(db, RESOURCES_COLLECTION)),
    getDocs(buildBookingsQuery({ status: 'active' })),
  ]);

  const activeBookings = activeBookingsSnapshot.docs.map(normalizeBooking);
  const relevantIds = resourceIds ? new Set(resourceIds) : null;
  const batch = writeBatch(db);
  let hasChanges = false;

  resourcesSnapshot.docs.forEach((resourceSnapshot) => {
    if (relevantIds && !relevantIds.has(resourceSnapshot.id)) {
      return;
    }

    const resourceData = resourceSnapshot.data();
    const hasCurrentBooking = activeBookings.some((booking) => (
      booking.resourceId === resourceSnapshot.id &&
      booking.startTime <= now &&
      booking.endTime > now
    ));

    const nextStatus = hasCurrentBooking ? 'occupied' : 'available';

    if (resourceData.status !== nextStatus) {
      hasChanges = true;
      batch.update(resourceSnapshot.ref, { status: nextStatus });
    }
  });

  if (hasChanges) {
    await batch.commit();
  }
}

export async function getBookings(filters = {}) {
  const snapshot = await getDocs(buildBookingsQuery(filters));
  return applyBookingFilters(snapshot.docs.map(normalizeBooking), filters);
}

export async function getBookingsForResourceOnDate(resourceId, date) {
  const { start, end } = getDayBounds(date);
  return getBookings({ resourceId, dayStart: start, dayEnd: end });
}

export function listenToBookings(filters, callback, onError) {
  return onSnapshot(
    buildBookingsQuery(filters),
    (snapshot) => callback(applyBookingFilters(snapshot.docs.map(normalizeBooking), filters)),
    onError,
  );
}

export function listenToActiveBookings(callback, onError) {
  return listenToBookings({ status: 'active' }, callback, onError);
}

export function listenToResourceBookings(resourceId, date, callback, onError) {
  const { start, end } = getDayBounds(date);
  return listenToBookings({ resourceId, dayStart: start, dayEnd: end }, callback, onError);
}

export async function createBooking({ userId, resourceId, startTime, endTime }) {
  const normalizedStartTime = toDate(startTime);
  const normalizedEndTime = toDate(endTime);
  const bookingRef = doc(collection(db, BOOKINGS_COLLECTION));

  if (!normalizedStartTime || !normalizedEndTime || normalizedStartTime >= normalizedEndTime) {
    throw new Error('Please choose a valid booking time.');
  }

  if (normalizedEndTime <= new Date()) {
    throw new Error('Please choose a future time slot.');
  }

  await runTransaction(db, async (transaction) => {
    const conflictingBookingsSnapshot = await transaction.get(
      buildBookingsQuery({ resourceId, status: 'active' }),
    );

    const hasConflict = conflictingBookingsSnapshot.docs
      .map(normalizeBooking)
      .some((booking) => datesOverlap(
        booking.startTime,
        booking.endTime,
        normalizedStartTime,
        normalizedEndTime,
      ));

    if (hasConflict) {
      throw new Error('That resource is already booked for the selected time.');
    }

    transaction.set(bookingRef, {
      userId,
      resourceId,
      startTime: Timestamp.fromDate(normalizedStartTime),
      endTime: Timestamp.fromDate(normalizedEndTime),
      status: 'active',
      createdAt: serverTimestamp(),
    });
  });

  await reconcileResourceStatuses([resourceId]);

  const createdBooking = await getDoc(bookingRef);
  return normalizeBooking(createdBooking);
}

export async function cancelBooking(bookingId) {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingSnapshot = await getDoc(bookingRef);

  if (!bookingSnapshot.exists()) {
    throw new Error('Booking not found.');
  }

  const booking = normalizeBooking(bookingSnapshot);

  await updateDoc(bookingRef, { status: 'cancelled' });
  await reconcileResourceStatuses([booking.resourceId]);
}

export async function syncExpiredBookings(now = new Date()) {
  const snapshot = await getDocs(buildBookingsQuery({ status: 'active' }));
  const expiredBookings = snapshot.docs
    .map(normalizeBooking)
    .filter((booking) => booking.endTime <= now);

  if (!expiredBookings.length) {
    await reconcileResourceStatuses(null, now);
    return 0;
  }

  const batch = writeBatch(db);

  expiredBookings.forEach((booking) => {
    batch.update(doc(db, BOOKINGS_COLLECTION, booking.id), { status: 'completed' });
  });

  await batch.commit();
  await reconcileResourceStatuses(
    [...new Set(expiredBookings.map((booking) => booking.resourceId))],
    now,
  );

  return expiredBookings.length;
}
