import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CalendarDays, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import { TIME_SLOTS } from '../utils/constants';
import { createBooking, listenToResourceBookings } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import { useNow } from '../hooks/useNow';
import {
  datesOverlap,
  getBookingWindow,
  getResourceTypeLabel,
  getToday,
  getStatusLabel,
  isPastBookingSlot,
} from '../utils/helpers';

export default function BookingModal({ isOpen, onClose, resource, onBooked }) {
  const { user } = useAuth();
  const now = useNow();
  const [date, setDate] = useState(getToday());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dayBookings, setDayBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !resource) return;
    setDate(getToday());
    setSelectedSlot(null);
    setError('');
    setSuccess(false);
    setDayBookings([]);
  }, [isOpen, resource]);

  useEffect(() => {
    if (!isOpen || !resource?.id) return undefined;

    setSlotsLoading(true);
    const stopListener = listenToResourceBookings(
      resource.id,
      date,
      (bookings) => {
        setDayBookings(bookings);
        setSlotsLoading(false);
      },
      () => {
        setDayBookings([]);
        setSlotsLoading(false);
      },
    );

    return stopListener;
  }, [date, isOpen, resource]);

  const bookedSlots = useMemo(() => {
    const nextBookedSlots = new Set();

    dayBookings
      .filter((booking) => booking.status === 'active')
      .forEach((booking) => {
        TIME_SLOTS.forEach((slot) => {
          const slotWindow = getBookingWindow(date, slot);
          if (!slotWindow) return;

          if (datesOverlap(
            booking.startTime,
            booking.endTime,
            slotWindow.startTime,
            slotWindow.endTime,
          )) {
            nextBookedSlots.add(slot);
          }
        });
      });

    return nextBookedSlots;
  }, [date, dayBookings]);

  const handleBook = async () => {
    if (!selectedSlot || !user || !resource?.id) return;

    const slotWindow = getBookingWindow(date, selectedSlot);
    if (!slotWindow) return;

    const resourceId = resource?.id;
    const userId = user?.uid;
    const startTime = slotWindow?.startTime;
    const endTime = slotWindow?.endTime;

    if (!resourceId || !startTime || !endTime) return;
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      await createBooking({
        resourceId,
        userId,
        startTime,
        endTime,
      });

      setSuccess(true);

      window.setTimeout(() => {
        onBooked?.();
        onClose();
      }, 1500);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[BookingModal] createBooking failed:', err);
      setError(err?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!resource) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Resource" maxWidth="max-w-md">
      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h4 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Booking Confirmed</h4>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {resource.name} | {date} | {selectedSlot}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-bold">
              {resource.name[0]}
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-white text-sm">{resource.name}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {getResourceTypeLabel(resource.type)} | {resource.location} | {getStatusLabel(resource.status)}
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              <CalendarDays size={15} />
              Select Date
            </label>
            <input
              type="date"
              value={date}
              min={getToday()}
              onChange={(event) => setDate(event.target.value)}
              className="input-field"
              id="booking-date"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              <Clock size={15} />
              Select Time Slot
            </label>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="animate-spin text-primary-500" size={20} />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const slotWindow = getBookingWindow(date, slot);
                  const isBooked = bookedSlots.has(slot);
                  const isPast = slotWindow
                    ? isPastBookingSlot(slotWindow.startTime, slotWindow.endTime, now)
                    : false;
                  const isSelected = selectedSlot === slot;
                  const isDisabled = isBooked || isPast;

                  return (
                    <button
                      key={slot}
                      onClick={() => !isDisabled && setSelectedSlot(slot)}
                      disabled={isDisabled}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors duration-300 transition-all ${
                        isDisabled
                          ? 'bg-gray-100 dark:bg-gray-800 text-surface-400 dark:text-surface-600 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                            : 'bg-surface-50 dark:bg-surface-900 text-surface-700 dark:text-surface-300 hover:bg-primary-50 dark:hover:bg-primary-950/50 border border-surface-200 dark:border-surface-700'
                      }`}
                    >
                      {slot.split(' - ')[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={!selectedSlot || loading}
            className="btn-primary w-full py-3 transition-colors duration-300"
            id="confirm-booking-btn"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirm Booking
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}
