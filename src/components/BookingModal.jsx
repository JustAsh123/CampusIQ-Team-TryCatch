import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import { TIME_SLOTS } from '../utils/constants';
import { getBookingsForResourceOnDate } from '../services/bookingService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { getToday } from '../utils/helpers';

export default function BookingModal({ isOpen, onClose, resource, onBooked }) {
  const { user } = useAuth();
  const [date, setDate] = useState(getToday());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !resource) return;
    setSelectedSlot(null);
    setError('');
    setSuccess(false);
    fetchBookedSlots(date);
  }, [isOpen, resource, date]);

  const fetchBookedSlots = async (d) => {
    if (!resource) return;
    try {
      setSlotsLoading(true);
      const bookings = await getBookingsForResourceOnDate(resource.id, d);
      const slots = bookings
        .filter((b) => b.status !== 'Cancelled')
        .map((b) => b.timeSlot);
      setBookedSlots(slots);
    } catch {
      setBookedSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot || !user) return;
    try {
      setLoading(true);
      setError('');
      await createBooking({
        resourceId: resource.id,
        resourceName: resource.name,
        userId: user.uid,
        userName: user.displayName || user.email,
        date,
        timeSlot: selectedSlot,
      });
      setSuccess(true);
      setTimeout(() => {
        onBooked?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
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
          <h4 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Booking Confirmed!</h4>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {resource.name} • {date} • {selectedSlot}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Resource info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-white text-sm font-bold">
              {resource.name[0]}
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-white text-sm">{resource.name}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">{resource.type} • {resource.location}</p>
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              <CalendarDays size={15} />
              Select Date
            </label>
            <input
              type="date"
              value={date}
              min={getToday()}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              id="booking-date"
            />
          </div>

          {/* Time slots */}
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
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => !isBooked && setSelectedSlot(slot)}
                      disabled={isBooked}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        isBooked
                          ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-600 cursor-not-allowed line-through'
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Book button */}
          <button
            onClick={handleBook}
            disabled={!selectedSlot || loading}
            className="btn-primary w-full py-3"
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
