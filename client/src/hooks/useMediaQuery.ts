import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches
 * @param query - CSS media query string
 * @returns Boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

// Preset breakpoints matching Tailwind CSS
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

/**
 * Hook to detect if screen is mobile
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(breakpoints.md);
}

/**
 * Hook to detect if screen is tablet
 */
export function useIsTablet(): boolean {
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  return isMd && !isLg;
}

/**
 * Hook to detect if screen is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.lg);
}