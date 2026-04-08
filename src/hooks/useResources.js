import { startTransition, useEffect, useMemo, useState } from 'react';
import { listenToActiveBookings, syncExpiredBookings } from '../services/bookings';
import { listenToResources } from '../services/resources';
import { getResourceAvailability } from '../utils/helpers';
import { useNow } from './useNow';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = useNow();

  useEffect(() => {
    let resourcesReady = false;
    let bookingsReady = false;

    const finishLoading = () => {
      if (resourcesReady && bookingsReady) {
        setLoading(false);
      }
    };

    const handleError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    syncExpiredBookings().catch(() => {});

    const stopResourcesListener = listenToResources(
      (nextResources) => {
        startTransition(() => {
          setResources(nextResources);
          resourcesReady = true;
          setError(null);
          finishLoading();
        });
      },
      handleError,
    );

    const stopBookingsListener = listenToActiveBookings(
      (nextBookings) => {
        startTransition(() => {
          setActiveBookings(nextBookings);
          bookingsReady = true;
          finishLoading();
        });
      },
      handleError,
    );

    return () => {
      stopResourcesListener();
      stopBookingsListener();
    };
  }, []);

  const liveResources = useMemo(() => (
    resources.map((resource) => ({
      ...resource,
      status: getResourceAvailability(resource, activeBookings, now),
    }))
  ), [activeBookings, now, resources]);

  return {
    resources: liveResources,
    loading,
    error,
    refetch: syncExpiredBookings,
  };
}

export function useAvailableResources() {
  const { resources, loading, error, refetch } = useResources();

  return {
    resources: useMemo(
      () => resources.filter((resource) => resource.status === 'available'),
      [resources],
    ),
    loading,
    error,
    refetch,
  };
}
