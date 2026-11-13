'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { StatusPill } from '@/components/StatusPill';
import type { ConversaPreview, Lead, LeadStatus, PageResult } from '@/lib/types';
import { CORES, ETAPAS, statusLabel } from '@/lib/status';

function tempoRelativo(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
}

export default function DashboardPage() {
  const { me } = useAuth();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [total, setTotal] = useState(0);
  const [conversas, setConversas] = useState<ConversaPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Uma requisição só: a contagem por etapa sai da própria lista (até 100 leads).
        const [page, conv] = await Promise.all([
          api<PageResult<Lead>>('/leads?page=1&limit=100'),
          api<ConversaPreview[]>('/conversas').catch(() => [] as ConversaPreview[]),
        ]);
        if (!cancelled) {
          setLeads(page.data);
          setTotal(page.total);
          setConversas(conv);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const porEtapa = useMemo(() => {
    const mapa = Object.fromEntries(ETAPAS.map((e) => [e, 0])) as Record<LeadStatus, number>;
    for (const l of leads ?? []) mapa[l.status] += 1;
    return mapa;
  }, [leads]);

  const fechados = porEtapa.CLIENTE;
  const perdidos = porEtapa.PERDIDO;
  const ativos = total - fechados - perdidos;
  const conversao = fechados + perdidos > 0 ? Math.round((fechados / (fechados + perdidos)) * 100) : 0;
  const maior = Math.max(1, ...ETAPAS.map((e) => porEtapa[e]));
  const recentes = [...(leads ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const kpis = [
    { titulo: 'Leads no total', valor: total, detalhe: 'em todas as etapas' },
    { titulo: 'Em andamento', valor: ativos, detalhe: 'ainda sem desfecho' },
    { titulo: 'Clientes fechados', valor: fechados, detalhe: 'vendas concluídas' },
    { titulo: 'Taxa de conversão', valor: `${conversao}%`, detalhe: 'fechados ÷ (fechados + perdidos)' },
  ];

  return (
    <div className="anim-subir">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">Olá, {me?.nome?.split(' ')[0]}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Visão geral</h1>
        </div>
        <Link
          href="/leads"
          className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]"
        >
          Ver todos os leads →
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-[var(--danger)]">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.titulo} className="card p-5">
            <p className="text-sm text-[var(--muted)]">{k.titulo}</p>
            <p className="mt-3 font-display text-4xl font-semibold tabular-nums tracking-tight">
              {leads ? k.valor : '—'}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">{k.detalhe}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3">
          <h2 className="font-display text-lg font-semibold">Funil de vendas</h2>
          <p className="text-sm text-[var(--muted)]">Quantos leads estão em cada etapa agora</p>
          <div className="mt-6 space-y-3">
            {ETAPAS.map((etapa) => {
              const qtd = porEtapa[etapa];
              return (
                <Link
                  key={etapa}
                  href={`/leads?status=${etapa}`}
                  className="group grid grid-cols-[120px_1fr_32px] items-center gap-3 text-sm"
                >
                  <span className="text-[var(--muted)] group-hover:text-[var(--ink)]">
                    {statusLabel(etapa)}
                  </span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <span
                      className="block h-full rounded-full transition-all duration-700"
                      style={{
                        width: leads ? `${Math.max(qtd ? 6 : 0, (qtd / maior) * 100)}%` : '0%',
                        background: CORES[etapa].barra,
                      }}
                    />
                  </span>
                  <span className="text-right tabular-nums">{leads ? qtd : '—'}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Conversas recentes</h2>
            <Link href="/conversas" className="text-xs text-[var(--accent)] hover:underline">
              Abrir
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {conversas.slice(0, 5).map((c) => (
              <li key={c.leadId}>
                <Link href={`/conversas?lead=${c.leadId}`} className="flex gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-xs font-semibold">
                    {c.nome.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.nome}</span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {tempoRelativo(c.lastMessage.createdAt)}
                      </span>
                    </span>
                    <span className="block truncate text-sm text-[var(--muted)]">
                      {c.lastMessage.direcao === 'OUTBOUND' ? 'Você: ' : ''}
                      {c.lastMessage.texto}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            {leads && conversas.length === 0 && (
              <li className="py-6 text-center text-sm text-[var(--muted)]">Nenhuma conversa ainda.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Últimos leads</h2>
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {recentes.map((l) => (
            <li key={l.id}>
              <Link
                href={`/leads/${l.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <span>
                  <span className="font-medium">{l.nome}</span>
                  <span className="ml-2 text-[var(--muted)]">{l.interesse ?? ''}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)]">{l.origem}</span>
                  <StatusPill status={l.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
