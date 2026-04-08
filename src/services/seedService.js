import { collection, addDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { randomFrom, randomInt, getDateOffset } from '../utils/helpers';
import { TIME_SLOTS, BOOKING_STATUS } from '../utils/constants';

const RESOURCES_DATA = [
  // Labs
  { name: 'AI Research Lab', type: 'Lab', capacity: 30, location: 'Block A, Room 101', description: 'Advanced AI/ML research facility with GPU workstations', features: ['GPU Workstations', 'High-Speed Internet', 'Whiteboard'] },
  { name: 'Robotics Lab', type: 'Lab', capacity: 20, location: 'Block A, Room 105', description: 'Robotics prototyping and testing facility', features: ['3D Printers', 'Soldering Stations', 'Robot Arms'] },
  { name: 'Chemistry Lab', type: 'Lab', capacity: 25, location: 'Block B, Room 201', description: 'General chemistry laboratory with fume hoods', features: ['Fume Hoods', 'Chemical Storage', 'Eye Wash Station'] },
  { name: 'Physics Lab', type: 'Lab', capacity: 25, location: 'Block B, Room 205', description: 'Physics experiments and demonstrations', features: ['Oscilloscopes', 'Laser Equipment', 'Optics Table'] },
  { name: 'Computer Lab A', type: 'Lab', capacity: 40, location: 'Block C, Room 301', description: 'General purpose computer lab with latest hardware', features: ['40 Workstations', 'Dual Monitors', 'Software Suite'] },
  { name: 'Computer Lab B', type: 'Lab', capacity: 35, location: 'Block C, Room 305', description: 'Programming and development lab', features: ['35 Workstations', 'IDE Setup', 'Version Control'] },
  { name: 'Biotech Lab', type: 'Lab', capacity: 15, location: 'Block D, Room 101', description: 'Biotechnology research and experimentation', features: ['PCR Machine', 'Centrifuge', 'Microscopes'] },
  { name: 'Electronics Workshop', type: 'Lab', capacity: 20, location: 'Block A, Room 110', description: 'Electronics design and prototyping workshop', features: ['Oscilloscopes', 'Signal Generators', 'PCB Printers'] },
  { name: 'Data Science Lab', type: 'Lab', capacity: 30, location: 'Block C, Room 310', description: 'Data analytics and visualization center', features: ['High-RAM Workstations', 'Large Displays', 'Statistical Software'] },

  // Rooms
  { name: 'Seminar Hall A', type: 'Room', capacity: 100, location: 'Main Building, 1st Floor', description: 'Large seminar hall with projector and sound system', features: ['Projector', 'Sound System', 'Podium', 'AC'] },
  { name: 'Seminar Hall B', type: 'Room', capacity: 80, location: 'Main Building, 2nd Floor', description: 'Medium seminar hall for workshops', features: ['Projector', 'Whiteboard', 'AC'] },
  { name: 'Conference Room 101', type: 'Room', capacity: 15, location: 'Admin Block, 1st Floor', description: 'Executive conference room with video conferencing', features: ['Video Conferencing', 'Smart TV', 'Whiteboard'] },
  { name: 'Conference Room 202', type: 'Room', capacity: 12, location: 'Admin Block, 2nd Floor', description: 'Small meeting room for team discussions', features: ['Smart TV', 'Whiteboard', 'AC'] },
  { name: 'Lecture Hall 1', type: 'Room', capacity: 150, location: 'Academic Block, Ground Floor', description: 'Large lecture hall with tiered seating', features: ['Tiered Seating', 'Dual Projectors', 'Mic System'] },
  { name: 'Lecture Hall 2', type: 'Room', capacity: 120, location: 'Academic Block, 1st Floor', description: 'Standard lecture hall', features: ['Projector', 'Sound System', 'AC'] },
  { name: 'Study Room 301', type: 'Room', capacity: 8, location: 'Library, 3rd Floor', description: 'Quiet study room for group work', features: ['Whiteboard', 'Power Outlets', 'Quiet Zone'] },
  { name: 'Study Room 302', type: 'Room', capacity: 8, location: 'Library, 3rd Floor', description: 'Collaborative study space', features: ['Smart Screen', 'Power Outlets', 'Quiet Zone'] },
  { name: 'Board Room', type: 'Room', capacity: 20, location: 'Admin Block, 3rd Floor', description: 'Premium boardroom for official meetings', features: ['Video Conferencing', 'Premium Furniture', 'Refreshments'] },

  // Equipment
  { name: '3D Printer - Ultimaker', type: 'Equipment', capacity: 1, location: 'Maker Space, Block A', description: 'High-precision FDM 3D printer', features: ['PLA/ABS Printing', 'Auto Leveling', '0.1mm Precision'] },
  { name: 'Laser Cutter', type: 'Equipment', capacity: 1, location: 'Maker Space, Block A', description: 'CO2 laser cutter for wood, acrylic, and fabric', features: ['40W Power', 'Auto Focus', 'Ventilation System'] },
  { name: 'Oscilloscope Set', type: 'Equipment', capacity: 5, location: 'Electronics Workshop', description: 'Digital oscilloscope set for signal analysis', features: ['4 Channel', '200MHz Bandwidth', 'USB Export'] },
  { name: 'DSLR Camera Kit', type: 'Equipment', capacity: 3, location: 'Media Center', description: 'Professional DSLR cameras with lenses', features: ['Canon EOS R5', 'Multiple Lenses', 'Tripod'] },
  { name: 'Drone Kit', type: 'Equipment', capacity: 2, location: 'Outdoor Lab', description: 'DJI drones for aerial photography and research', features: ['4K Camera', 'GPS', '30min Flight Time'] },
  { name: 'VR Headset Lab', type: 'Equipment', capacity: 10, location: 'Block C, Room 315', description: 'Virtual reality headsets for immersive learning', features: ['Meta Quest 3', 'Hand Tracking', 'Room Scale'] },
  { name: 'Projector Unit A', type: 'Equipment', capacity: 1, location: 'AV Storage', description: 'Portable high-lumen projector', features: ['5000 Lumens', '4K Resolution', 'Wireless'] },
];

const MOCK_USERS = [
  { id: 'user_001', name: 'Aarav Patel' },
  { id: 'user_002', name: 'Priya Sharma' },
  { id: 'user_003', name: 'Rahul Gupta' },
  { id: 'user_004', name: 'Sneha Reddy' },
  { id: 'user_005', name: 'Vikram Singh' },
  { id: 'user_006', name: 'Ananya Iyer' },
  { id: 'user_007', name: 'Karthik Nair' },
  { id: 'user_008', name: 'Meera Joshi' },
  { id: 'user_009', name: 'Arjun Das' },
  { id: 'user_010', name: 'Divya Menon' },
];

async function clearCollection(name) {
  const snapshot = await getDocs(collection(db, name));
  const deletes = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletes);
}

export async function seedDatabase(progressCallback) {
  try {
    // Clear existing data
    progressCallback?.('Clearing existing data...');
    await clearCollection('resources');
    await clearCollection('bookings');

    // Seed resources
    progressCallback?.('Seeding resources...');
    const resourceRefs = [];
    for (const res of RESOURCES_DATA) {
      const status = randomFrom(['Available', 'Available', 'Available', 'Occupied']);
      const docRef = await addDoc(collection(db, 'resources'), {
        ...res,
        status,
        createdAt: Timestamp.now(),
      });
      resourceRefs.push({ id: docRef.id, name: res.name, type: res.type });
    }

    // Seed bookings
    progressCallback?.('Generating booking history...');
    const bookings = [];
    for (let i = 0; i < 70; i++) {
      const resource = randomFrom(resourceRefs);
      const user = randomFrom(MOCK_USERS);
      const dayOffset = randomInt(-30, 14);
      const date = getDateOffset(dayOffset);
      const timeSlot = randomFrom(TIME_SLOTS);

      // Determine status based on date
      let status;
      if (dayOffset < -1) {
        status = randomFrom([BOOKING_STATUS.COMPLETED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED]);
      } else if (dayOffset > 1) {
        status = randomFrom([BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED]);
      } else {
        status = BOOKING_STATUS.CONFIRMED;
      }

      bookings.push({
        resourceId: resource.id,
        resourceName: resource.name,
        userId: user.id,
        userName: user.name,
        date,
        timeSlot,
        status,
        createdAt: Timestamp.fromDate(new Date(date)),
      });
    }

    for (const booking of bookings) {
      await addDoc(collection(db, 'bookings'), booking);
    }

    progressCallback?.('Seeding complete! ✓');
    return { resources: resourceRefs.length, bookings: bookings.length };
  } catch (error) {
    progressCallback?.(`Error: ${error.message}`);
    throw error;
  }
}
