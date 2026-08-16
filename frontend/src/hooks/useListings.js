import { useCallback, useEffect, useRef, useState } from 'react';
import { listListings } from '../services/listing.service.js';

// Fetches a page of listings for the given params, tracking loading/error.
// A request counter guards against out-of-order responses.
export function useListings(params) {
  const [result, setResult] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const key = JSON.stringify(params);

  const fetchPage = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    listListings(params)
      .then((data) => {
        if (id === requestId.current) setResult(data);
      })
      .catch((err) => {
        if (id === requestId.current) setError(err);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
    // params is captured via `key` in the effect dependency below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { ...result, loading, error, refetch: fetchPage };
}
