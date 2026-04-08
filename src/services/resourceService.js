import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'resources';

export async function getAllResources() {
  const q = query(collection(db, COLLECTION), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getResourceById(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getResourcesByType(type) {
  const all = await getAllResources();
  return all.filter((r) => r.type === type);
}

export async function getAvailableResources() {
  const all = await getAllResources();
  return all.filter((r) => r.status === 'Available');
}
