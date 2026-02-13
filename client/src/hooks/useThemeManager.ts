import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Hook to safely use next-themes without hydration issues
 * Only uses theme after component is mounted on client
 */
export const useThemeManager = () => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      theme: 'dark',
      setTheme: () => {},
      themes: ['light', 'dark'],
      systemTheme: 'dark',
      resolvedTheme: 'dark',
    };
  }

  return theme;
};
