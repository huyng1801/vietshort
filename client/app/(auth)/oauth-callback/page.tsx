'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/common';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      const error = searchParams.get('error');
      if (error) {
        router.push(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      // Backend redirects with tokens in URL params
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (accessToken && refreshToken) {
        try {
          await handleOAuthCallback(accessToken, refreshToken);
          router.push('/');
        } catch {
          router.push('/login?error=oauth_failed');
        }
      } else {
        router.push('/login?error=missing_tokens');
      }
    };

    processCallback();
  }, [searchParams, router, handleOAuthCallback]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loading size="lg" />
      <p className="text-gray-400">Đang xử lý đăng nhập...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<Loading size="lg" />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}