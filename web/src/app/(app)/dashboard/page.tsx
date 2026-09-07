'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { LeadStatus, PageResult } from '@/lib/types';
import { statusLabel } from '@/lib/status';

const cards: { status: LeadStatus; title: string }[] = [
  { status: 'NOVO', title: 'Leads novos' },
  { status: 'EM_ATENDIMENTO', title: 'Em atendimento' },
  { status: 'QUALIFICADO', title: 'Qualificados' },
  { status: 'CLIENTE', title: 'Clientes fechados' },
];

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const entries = await Promise.all(
          cards.map(async (card) => {
            const page = await api<PageResult<unknown>>(
              `/leads?status=${card.status}&page=1&limit=1`
            );
            return [card.status, page.total] as const;
          })
        );
        if (!cancelled) {
          setCounts(Object.fromEntries(entries));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Visão rápida do funil no tenant atual.
          </p>
        </div>
        <Link
          href="/leads"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Ver leads →
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-sm text-[var(--danger)]">{error}</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.status}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5"
          >
            <p className="text-sm text-[var(--muted)]">{card.title}</p>
            <p className="mt-3 font-display text-4xl tabular-nums tracking-tight">
              {counts[card.status] ?? '—'}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-[var(--muted)]">
              {statusLabel(card.status)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
