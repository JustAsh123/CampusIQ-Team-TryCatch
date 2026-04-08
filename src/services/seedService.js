import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const INITIAL_RESOURCES = [
  { name: 'Computer Lab A', type: 'lab', capacity: 40, location: 'Tech Block, Level 1' },
  { name: 'Computer Lab B', type: 'lab', capacity: 36, location: 'Tech Block, Level 1' },
  { name: 'AI Lab', type: 'lab', capacity: 28, location: 'Innovation Center, Room 203' },
  { name: 'Data Science Lab', type: 'lab', capacity: 32, location: 'Innovation Center, Room 205' },
  { name: 'Electronics Lab', type: 'lab', capacity: 24, location: 'Engineering Block, Room 112' },
  { name: 'IoT Lab', type: 'lab', capacity: 22, location: 'Engineering Block, Room 118' },
  { name: 'Robotics Lab', type: 'lab', capacity: 20, location: 'Maker Wing, Studio 4' },
  { name: 'Biotech Lab', type: 'lab', capacity: 18, location: 'Science Block, Room 304' },
  { name: 'Media Lab', type: 'lab', capacity: 16, location: 'Library Annex, Room 12' },
  { name: 'Language Lab', type: 'lab', capacity: 30, location: 'Humanities Block, Room 208' },
  { name: 'Design Studio', type: 'lab', capacity: 26, location: 'Arts Block, Room 16' },
  { name: 'Project Room 1', type: 'room', capacity: 10, location: 'Library, Level 2' },
  { name: 'Project Room 2', type: 'room', capacity: 10, location: 'Library, Level 2' },
  { name: 'Study Room Alpha', type: 'room', capacity: 6, location: 'Library, Level 3' },
  { name: 'Study Room Beta', type: 'room', capacity: 6, location: 'Library, Level 3' },
  { name: 'Study Room Gamma', type: 'room', capacity: 8, location: 'Library, Level 3' },
  { name: 'Conference Room Cedar', type: 'room', capacity: 14, location: 'Admin Block, Level 2' },
  { name: 'Conference Room Maple', type: 'room', capacity: 12, location: 'Admin Block, Level 2' },
  { name: 'Seminar Room East', type: 'room', capacity: 48, location: 'Academic Block, Level 1' },
  { name: 'Seminar Room West', type: 'room', capacity: 48, location: 'Academic Block, Level 1' },
  { name: 'Training Room Nexus', type: 'room', capacity: 22, location: 'Placement Cell, Level 1' },
  { name: 'Lecture Room 204', type: 'room', capacity: 60, location: 'Academic Block, Level 2' },
  { name: 'Portable Projector 1', type: 'equipment', capacity: 1, location: 'AV Desk, Main Lobby' },
  { name: 'Portable Projector 2', type: 'equipment', capacity: 1, location: 'AV Desk, Main Lobby' },
  { name: 'Laptop Cart A', type: 'equipment', capacity: 12, location: 'IT Support Hub' },
  { name: 'Laptop Cart B', type: 'equipment', capacity: 10, location: 'IT Support Hub' },
  { name: 'DSLR Camera Kit', type: 'equipment', capacity: 2, location: 'Media Center' },
  { name: 'Wireless Mic Set', type: 'equipment', capacity: 4, location: 'AV Desk, Main Lobby' },
  { name: 'VR Headset Set', type: 'equipment', capacity: 6, location: 'Innovation Center, Room 210' },
  { name: '3D Printer', type: 'equipment', capacity: 1, location: 'Maker Wing, Bay 2' },
  { name: 'Laser Cutter', type: 'equipment', capacity: 1, location: 'Maker Wing, Bay 3' },
  { name: 'Podcast Recording Kit', type: 'equipment', capacity: 2, location: 'Media Center' },
];

export async function seedResourcesIfEmpty(progressCallback) {
  // Ensure seeding only runs once per runtime (React StrictMode may double-invoke effects).
  if (seedResourcesIfEmpty._seedOncePromise) {
    return seedResourcesIfEmpty._seedOncePromise;
  }

  seedResourcesIfEmpty._seedOncePromise = (async () => {
  progressCallback?.('Checking Firestore resources...');

  const resourcesSnapshot = await getDocs(collection(db, 'resources'));

  if (!resourcesSnapshot.empty) {
    progressCallback?.('Resources already seeded.');
    return { seeded: false, count: resourcesSnapshot.size };
  }

  progressCallback?.('Seeding initial resources...');

  const batch = writeBatch(db);

  INITIAL_RESOURCES.forEach((resource) => {
    batch.set(doc(collection(db, 'resources')), {
      ...resource,
      status: 'available',
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();

  progressCallback?.(`Seeded ${INITIAL_RESOURCES.length} resources.`);

  return { seeded: true, count: INITIAL_RESOURCES.length };
  })().catch((err) => {
    // Allow retry if the seed attempt fails.
    seedResourcesIfEmpty._seedOncePromise = null;
    throw err;
  });

  return seedResourcesIfEmpty._seedOncePromise;
}

// Private runtime cache to ensure single seeding.
// (We attach to the function to keep this change localized.)
seedResourcesIfEmpty._seedOncePromise = null;
