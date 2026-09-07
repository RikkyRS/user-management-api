'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { me, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(me ? '/dashboard' : '/login');
  }, [loading, me, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
      Redirecionando…
    </div>
  );
}
