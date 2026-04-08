import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'bookings';

export async function createBooking({ resourceId, resourceName, userId, userName, date, timeSlot }) {
  // Check for double booking
  const existing = await getBookingsForResourceOnDate(resourceId, date);
  const conflict = existing.find((b) => b.timeSlot === timeSlot && b.status !== 'Cancelled');
  if (conflict) {
    throw new Error('This time slot is already booked. Please select a different slot.');
  }

  const booking = {
    resourceId,
    resourceName,
    userId,
    userName,
    date,
    timeSlot,
    status: 'Confirmed',
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, COLLECTION), booking);
  return { id: docRef.id, ...booking };
}

export async function getUserBookings(userId) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllBookings() {
  const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getBookingsForResourceOnDate(resourceId, date) {
  const q = query(
    collection(db, COLLECTION),
    where('resourceId', '==', resourceId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function cancelBooking(bookingId) {
  const ref = doc(db, COLLECTION, bookingId);
  await updateDoc(ref, { status: 'Cancelled' });
}
