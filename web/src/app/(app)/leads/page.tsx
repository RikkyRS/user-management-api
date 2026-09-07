'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Lead, PageResult } from '@/lib/types';
import { statusLabel } from '@/lib/status';

function shortId(id: string | null): string {
  if (!id) return '—';
  return id.slice(0, 8);
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await api<PageResult<Lead>>('/leads?page=1&limit=50');
        if (!cancelled) {
          setLeads(page.data);
          setTotal(page.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao listar');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {loading ? 'Carregando…' : `${total} lead(s) no tenant`}
      </p>

      {error && (
        <p className="mt-6 text-sm text-[var(--danger)]">{error}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg)]/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-medium text-[var(--accent)] hover:underline"
                  >
                    {lead.nome}
                  </Link>
                </td>
                <td className="px-4 py-3">{statusLabel(lead.status)}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {shortId(lead.responsavelUsuarioId)}
                </td>
              </tr>
            ))}
            {!loading && leads.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-[var(--muted)]"
                >
                  Nenhum lead ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
