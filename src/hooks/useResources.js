import { useState, useEffect } from 'react';
import { getAllResources, getAvailableResources } from '../services/resourceService';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await getAllResources();
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return { resources, loading, error, refetch: fetchResources };
}

export function useAvailableResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAvailableResources()
      .then(setResources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { resources, loading };
}
