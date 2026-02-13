'use client';

import { useState, useCallback } from 'react';

export function useFilters<T extends Record<string, unknown>>(defaultFilters: T) {
  const [filters, setFilters] = useState<T>(defaultFilters);

  const updateFilter = useCallback((key: keyof T, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== '',
  );

  return { filters, setFilters, updateFilter, resetFilters, hasActiveFilters };
}
