'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Loading } from '@/components/common/Loading';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuthStore();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        router.push(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (code) {
        try {
          await handleOAuthCallback(code, state);
          router.push('/home');
        } catch (err) {
          router.push('/login?error=oauth_failed');
        }
      } else {
        router.push('/login');
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