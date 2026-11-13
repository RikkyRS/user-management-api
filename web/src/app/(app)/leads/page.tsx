'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { StatusPill } from '@/components/StatusPill';
import type { Lead, LeadStatus, PageResult } from '@/lib/types';
import { CORES, ETAPAS, statusLabel } from '@/lib/status';

type Visao = 'tabela' | 'kanban';

function formatarTelefone(t: string) {
  const d = t.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return t;
}

function LeadsConteudo() {
  const params = useSearchParams();
  const statusInicial = params.get('status') as LeadStatus | null;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<LeadStatus | 'TODOS'>(
    statusInicial && ETAPAS.includes(statusInicial) ? statusInicial : 'TODOS'
  );
  const [visao, setVisao] = useState<Visao>('tabela');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await api<PageResult<Lead>>('/leads?page=1&limit=100');
        if (!cancelled) {
          setLeads(page.data);
          setTotal(page.total);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao listar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtro !== 'TODOS' && l.status !== filtro) return false;
      if (!termo) return true;
      return [l.nome, l.telefone, l.email, l.interesse, l.origem]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(termo));
    });
  }, [leads, busca, filtro]);

  return (
    <div className="anim-subir">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {loading ? 'Carregando…' : `${visiveis.length} de ${total} lead(s)`}
          </p>
        </div>
        <div className="flex rounded-xl border border-[var(--line)] p-1 text-sm">
          {(['tabela', 'kanban'] as Visao[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisao(v)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                visao === v ? 'bg-[var(--surface-2)] text-[var(--ink)]' : 'text-[var(--muted)]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar por nome, telefone, interesse…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="min-w-[240px] flex-1 rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as LeadStatus | 'TODOS')}
          className="rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="TODOS">Todas as etapas</option>
          {ETAPAS.map((e) => (
            <option key={e} value={e}>
              {statusLabel(e)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-6 text-sm text-[var(--danger)]">{error}</p>}

      {visao === 'tabela' ? (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Lead</th>
                <th className="px-5 py-3 font-medium">Interesse</th>
                <th className="px-5 py-3 font-medium">Origem</th>
                <th className="px-5 py-3 font-medium">Etapa</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-[var(--line)] transition last:border-0 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/leads/${lead.id}`} className="font-medium hover:text-[var(--accent)]">
                      {lead.nome}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">{formatarTelefone(lead.telefone)}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--muted)]">{lead.interesse ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[var(--muted)]">{lead.origem ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={lead.status} />
                  </td>
                </tr>
              ))}
              {!loading && visiveis.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[var(--muted)]">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {ETAPAS.filter((e) => filtro === 'TODOS' || e === filtro).map((etapa) => {
            const doStatus = visiveis.filter((l) => l.status === etapa);
            return (
              <section key={etapa} className="w-64 shrink-0">
                <header className="mb-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="h-2 w-2 rounded-full" style={{ background: CORES[etapa].barra }} />
                    {statusLabel(etapa)}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{doStatus.length}</span>
                </header>
                <div className="space-y-3">
                  {doStatus.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="card block p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                    >
                      <p className="font-medium">{lead.nome}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{lead.interesse ?? 'Sem interesse informado'}</p>
                      <p className="mt-3 text-xs text-[var(--muted)]">{lead.origem}</p>
                    </Link>
                  ))}
                  {doStatus.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-[var(--line)] p-4 text-center text-xs text-[var(--muted)]">
                      Vazio
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Carregando…</p>}>
      <LeadsConteudo />
    </Suspense>
  );
}
