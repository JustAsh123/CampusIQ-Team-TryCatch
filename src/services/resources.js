import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { sortByName, toDate } from '../utils/helpers';

const COLLECTION = 'resources';

function normalizeResource(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name,
    type: data.type,
    capacity: data.capacity,
    status: data.status ?? 'available',
    location: data.location,
    createdAt: toDate(data.createdAt),
  };
}

export async function getResources() {
  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('name')));
  return snapshot.docs.map(normalizeResource);
}

export async function getResourceById(id) {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return normalizeResource(snapshot);
}

export async function getAvailableResources() {
  const resources = await getResources();
  return resources.filter((resource) => resource.status === 'available');
}

export function listenToResources(callback, onError) {
  const resourcesQuery = query(collection(db, COLLECTION), orderBy('name'));

  return onSnapshot(
    resourcesQuery,
    (snapshot) => callback(sortByName(snapshot.docs.map(normalizeResource))),
    onError,
  );
}

export async function updateResourceStatus(resourceId, status) {
  await updateDoc(doc(db, COLLECTION, resourceId), { status });
}
