'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Lead } from '@/lib/types';
import { statusLabel } from '@/lib/status';

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<Lead>(`/leads/${params.id}`);
        if (!cancelled) setLead(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Lead não encontrado'
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <div>
        <Link href="/leads" className="text-sm text-[var(--accent)]">
          ← Voltar
        </Link>
        <p className="mt-4 text-[var(--danger)]">{error}</p>
      </div>
    );
  }

  if (!lead) {
    return <p className="text-[var(--muted)]">Carregando…</p>;
  }

  return (
    <div>
      <Link href="/leads" className="text-sm text-[var(--accent)] hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-4 font-display text-3xl tracking-tight">{lead.nome}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {statusLabel(lead.status)}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            WhatsApp / telefone
          </p>
          <p className="mt-2 text-lg">{lead.telefone}</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            E-mail
          </p>
          <p className="mt-2 text-lg">{lead.email ?? '—'}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="font-medium">Informações</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">Origem</dt>
            <dd>{lead.origem ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Interesse</dt>
            <dd>{lead.interesse ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Responsável</dt>
            <dd>{lead.responsavelUsuarioId?.slice(0, 8) ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Atualizado</dt>
            <dd>{new Date(lead.updatedAt).toLocaleString('pt-BR')}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] p-5 text-sm text-[var(--muted)]">
        Histórico de conversas entra na próxima fase (WhatsApp).
      </div>
    </div>
  );
}
