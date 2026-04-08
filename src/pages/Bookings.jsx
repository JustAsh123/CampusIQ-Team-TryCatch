import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarCheck, Clock, Loader2, XCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useUserBookings } from '../hooks/useBookings';
import { useResources } from '../hooks/useResources';
import {
  formatDate,
  formatTimeRange,
  getBookingStatusColor,
  getResourceName,
  getStatusLabel,
} from '../utils/helpers';

export default function Bookings() {
  const { user } = useAuth();
  const { bookings, loading, cancelBooking } = useUserBookings(user?.uid);
  const { resources, loading: resourcesLoading } = useResources();
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('All');

  const resourcesById = useMemo(
    () => Object.fromEntries(resources.map((resource) => [resource.id, resource])),
    [resources],
  );

  const handleCancel = async (bookingId) => {
    setCancelling(bookingId);

    try {
      await cancelBooking(bookingId);
    } finally {
      setCancelling(null);
    }
  };

  const filteredBookings = filter === 'All'
    ? bookings
    : bookings.filter((booking) => booking.status === filter);

  const statusTabs = ['All', 'active', 'completed', 'cancelled'];

  if (loading || resourcesLoading) {
    return <PageWrapper><Loader text="Loading bookings..." /></PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Bookings</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Your Firestore bookings update here as soon as anything changes.
          </p>
        </div>
      </div>

      <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1 mb-6 w-fit">
        {statusTabs.map((tab) => {
          const count = tab === 'All' ? bookings.length : bookings.filter((booking) => booking.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {(tab === 'All' ? tab : getStatusLabel(tab))} ({count})
            </button>
          );
        })}
      </div>

      {filteredBookings.length > 0 ? (
        <div className="space-y-3">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {getResourceName(booking.resourceId, resourcesById)[0] || '?'}
                </div>
                <div>
                  <h4 className="font-semibold text-surface-900 dark:text-white">
                    {getResourceName(booking.resourceId, resourcesById)}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-surface-500 dark:text-surface-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(booking.startTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeRange(booking.startTime, booking.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:ml-auto">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getBookingStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
                {booking.status === 'active' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelling === booking.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900 transition-colors"
                  >
                    {cancelling === booking.id ? (
                      <Loader2 className="animate-spin" size={13} />
                    ) : (
                      <XCircle size={13} />
                    )}
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <CalendarCheck size={28} className="text-surface-400" />
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">No bookings found</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {filter !== 'All' ? `No ${getStatusLabel(filter).toLowerCase()} bookings right now.` : 'Head to Resources to create a live booking.'}
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
