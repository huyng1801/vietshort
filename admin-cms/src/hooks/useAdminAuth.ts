'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { isAuthenticated } from '@/lib/admin-auth';

export function useAdminAuth(requireAuth = false) {
  const router = useRouter();
  const { user, isLoading, hydrate, logout } = useAdminAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated()) {
      router.replace('/login');
    }
  }, [isLoading, requireAuth, router]);

  return { user, isLoading, isAuthenticated: isAuthenticated(), logout };
}
