'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { ConversaPreview, Mensagem, PageResult } from '@/lib/types';

function previewTexto(texto: string, max = 64): string {
  if (texto.length <= max) return texto;
  return `${texto.slice(0, max)}…`;
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ConversasPage() {
  const [conversas, setConversas] = useState<ConversaPreview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  const selected = conversas.find((c) => c.leadId === selectedId) ?? null;

  const carregarConversas = async (preferLeadId?: string | null) => {
    const list = await api<ConversaPreview[]>('/conversas');
    setConversas(list);
    if (preferLeadId && list.some((c) => c.leadId === preferLeadId)) {
      setSelectedId(preferLeadId);
    } else if (!preferLeadId && list[0] && !selectedId) {
      setSelectedId(list[0].leadId);
    }
  };

  const carregarMensagens = async (leadId: string) => {
    setLoadingThread(true);
    try {
      const page = await api<PageResult<Mensagem>>(
        `/conversas/${leadId}/mensagens?page=1&limit=100`
      );
      setMensagens(page.data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar mensagens');
      setMensagens([]);
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await carregarConversas();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao listar conversas');
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMensagens([]);
      return;
    }
    void carregarMensagens(selectedId);
  }, [selectedId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !texto.trim()) return;

    setSending(true);
    setError(null);
    try {
      const criada = await api<Mensagem>(`/conversas/${selectedId}/mensagens`, {
        method: 'POST',
        body: { texto: texto.trim() },
      });
      setMensagens((prev) => [...prev, criada]);
      setTexto('');
      await carregarConversas(selectedId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao enviar');
    } finally {
      setSending(false);
    }
  };

  const showListOnly = !selectedId;
  const showThreadOnMobile = Boolean(selectedId);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Conversas</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Threads WhatsApp do tenant — resposta manual
      </p>

      {error && (
        <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>
      )}

      <div className="mt-6 flex min-h-[28rem] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
        <aside
          className={`w-full border-[var(--line)] md:w-80 md:border-r ${
            showThreadOnMobile ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="border-b border-[var(--line)] px-4 py-3 text-xs uppercase tracking-wide text-[var(--muted)]">
            {loadingList ? 'Carregando…' : `${conversas.length} conversa(s)`}
          </div>
          <ul className="max-h-[28rem] overflow-y-auto">
            {conversas.map((c) => {
              const active = c.leadId === selectedId;
              return (
                <li key={c.leadId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.leadId)}
                    className={`w-full border-b border-[var(--line)] px-4 py-3 text-left last:border-0 ${
                      active
                        ? 'bg-[var(--accent-soft)]'
                        : 'hover:bg-[var(--bg)]/60'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{c.nome}</span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {formatHora(c.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-[var(--muted)]">
                      {c.lastMessage.direcao === 'OUTBOUND' ? 'Você: ' : ''}
                      {previewTexto(c.lastMessage.texto)}
                    </p>
                  </button>
                </li>
              );
            })}
            {!loadingList && conversas.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                Nenhuma conversa ainda.
              </li>
            )}
          </ul>
        </aside>

        <section
          className={`flex min-w-0 flex-1 flex-col ${
            showListOnly ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
                <button
                  type="button"
                  className="text-sm text-[var(--accent)] md:hidden"
                  onClick={() => setSelectedId(null)}
                >
                  ← Lista
                </button>
                <div className="min-w-0">
                  <p className="truncate font-medium">{selected.nome}</p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {selected.telefone}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {loadingThread && (
                  <p className="text-sm text-[var(--muted)]">Carregando…</p>
                )}
                {!loadingThread &&
                  mensagens.map((m) => {
                    const out = m.direcao === 'OUTBOUND';
                    return (
                      <div
                        key={m.id}
                        className={`flex ${out ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            out
                              ? 'bg-[var(--accent-soft)] text-[var(--ink)]'
                              : 'bg-[var(--bg)] text-[var(--ink)]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {m.texto}
                          </p>
                          <p className="mt-1 text-[10px] text-[var(--muted)]">
                            {formatHora(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {!loadingThread && mensagens.length === 0 && (
                  <p className="text-sm text-[var(--muted)]">Sem mensagens.</p>
                )}
              </div>

              <form
                onSubmit={onSubmit}
                className="flex gap-2 border-t border-[var(--line)] p-3"
              >
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Responder…"
                  className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !texto.trim()}
                  className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {sending ? '…' : 'Enviar'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--muted)]">
              Selecione uma conversa
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
