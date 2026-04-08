import { startTransition, useEffect, useMemo, useState } from 'react';
import {
  cancelBooking as cancelBookingService,
  listenToBookings,
  syncExpiredBookings,
} from '../services/bookings';
import { getLiveBookingStatus } from '../utils/helpers';
import { useNow } from './useNow';

function useRealtimeBookings(filters = {}) {
  const { resourceId, status, userId } = filters;
  const [rawBookings, setRawBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = useNow();

  useEffect(() => {
    const handleError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    syncExpiredBookings().catch(() => {});

    const intervalId = window.setInterval(() => {
      syncExpiredBookings().catch(() => {});
    }, 60_000);

    const stopListener = listenToBookings(
      { resourceId, status, userId },
      (nextBookings) => {
        startTransition(() => {
          setRawBookings(nextBookings);
          setError(null);
          setLoading(false);
        });
      },
      handleError,
    );

    return () => {
      stopListener();
      window.clearInterval(intervalId);
    };
  }, [resourceId, status, userId]);

  const bookings = useMemo(() => (
    rawBookings.map((booking) => ({
      ...booking,
      status: getLiveBookingStatus(booking, now),
    }))
  ), [now, rawBookings]);

  const cancelBooking = async (bookingId) => {
    await cancelBookingService(bookingId);
  };

  return {
    bookings,
    loading,
    error,
    refetch: syncExpiredBookings,
    cancelBooking,
  };
}

export function useUserBookings(userId) {
  return useRealtimeBookings({ userId: userId ?? '__no_user__' });
}

export function useAllBookings() {
  return useRealtimeBookings();
}
