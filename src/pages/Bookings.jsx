import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, XCircle, Loader2, Calendar, Clock, Building2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { useUserBookings } from '../hooks/useBookings';
import { formatDate, getBookingStatusColor } from '../utils/helpers';

export default function Bookings() {
  const { user } = useAuth();
  const { bookings, loading, cancelBooking } = useUserBookings(user?.uid);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('All');

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
    } catch {
      // Handle error silently
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'All' ? bookings : bookings.filter((b) => b.status === filter);
  const statusTabs = ['All', 'Confirmed', 'Completed', 'Cancelled'];

  if (loading) return <PageWrapper><Loader text="Loading bookings..." /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Bookings</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Manage your resource reservations
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1 mb-6 w-fit">
        {statusTabs.map((tab) => {
          const count = tab === 'All' ? bookings.length : bookings.filter((b) => b.status === tab).length;
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
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookings list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {booking.resourceName?.[0] || '?'}
                </div>
                <div>
                  <h4 className="font-semibold text-surface-900 dark:text-white">{booking.resourceName}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-surface-500 dark:text-surface-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {booking.timeSlot}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:ml-auto">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getBookingStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                {booking.status === 'Confirmed' && (
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
            {filter !== 'All' ? `No ${filter.toLowerCase()} bookings` : 'Head to Resources to book something'}
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
