'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loading } from '@/components/common/Loading';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) router.replace('/search?category=' + encodeURIComponent(slug));
  }, [slug, router]);

  return <Loading />;
}
