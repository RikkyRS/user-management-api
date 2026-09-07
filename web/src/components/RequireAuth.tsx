'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { AppShell } from '@/components/AppShell';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { me, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !me) {
      router.replace('/login');
    }
  }, [loading, me, router]);

  if (loading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--muted)]">
        Carregando…
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
