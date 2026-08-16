import { useEffect, useState } from 'react';

// Subscribes to a CSS media query and re-renders on change.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// True on viewports below ~720px.
export const useIsMobile = () => useMediaQuery('(max-width: 720px)');
