export const RESOURCE_TYPES = ['lab', 'room', 'equipment'];

export const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
];

export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
};

export const BOOKING_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RESOURCE_ICONS = {
  lab: 'FlaskConical',
  room: 'DoorOpen',
  equipment: 'Cpu',
};

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Resources', path: '/resources', icon: 'Building2' },
  { label: 'My Bookings', path: '/bookings', icon: 'CalendarCheck' },
  { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
];

export const CHART_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];
