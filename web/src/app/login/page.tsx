'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { api, ApiError } from '@/lib/api';
import type { EmpresaOption } from '@/lib/types';

export default function LoginPage() {
  const { login, loginDemo, me, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  /** Impede redirect enquanto o usuário escolhe empresa (caso 409). */
  const [pickingEmpresa, setPickingEmpresa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [demoDisponivel, setDemoDisponivel] = useState(false);
  const [entrandoDemo, setEntrandoDemo] = useState(false);

  useEffect(() => {
    api<{ ativo: boolean }>('/auth/demo', { auth: false })
      .then((r) => setDemoDisponivel(r.ativo))
      .catch(() => setDemoDisponivel(false));
  }, []);

  async function entrarDemo() {
    setError(null);
    setEntrandoDemo(true);
    try {
      await loginDemo();
      router.replace('/dashboard');
    } catch {
      setError('A demonstração não está disponível agora.');
    } finally {
      setEntrandoDemo(false);
    }
  }

  useEffect(() => {
    // Só redireciona se já tem tenant na sessão e não está no meio da escolha
    if (!loading && !pickingEmpresa && me?.empresaId) {
      router.replace('/dashboard');
    }
  }, [loading, me, router, pickingEmpresa]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email.trim(), senha, empresaId || undefined);

      // Várias memberships → usuário escolhe (fica na tela)
      if (result.needsEmpresa) {
        setPickingEmpresa(true);
        setEmpresas(result.empresas);
        setError('Selecione a empresa para continuar.');
        return;
      }

      // CRM_OWNER sem tenant: auto 1ª empresa (sem flash de select)
      if (result.usuario && !result.usuario.empresaId) {
        const lista = await api<{ id: string; nome: string }[]>('/empresas');
        if (lista.length === 0) {
          setError('Nenhuma empresa cadastrada. Crie uma antes de entrar.');
          return;
        }
        const primeira = lista[0];
        await login(email.trim(), senha, primeira.id);
        setPickingEmpresa(false);
        router.replace('/dashboard');
        return;
      }

      setPickingEmpresa(false);
      router.replace('/dashboard');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível entrar.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const campo =
    'mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]';

  return (
    <div className="grid min-h-screen bg-[var(--bg)] lg:grid-cols-2">
      <section className="grid-glow relative hidden flex-col justify-between overflow-hidden border-r border-[var(--line)] p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] font-bold text-[#0a0d14]">
            P
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Pipeline CRM</span>
        </div>

        <div className="anim-subir max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Cada lead no lugar certo.
            <span className="block bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">
              Nenhuma venda esquecida.
            </span>
          </h1>
          <p className="mt-4 text-[var(--muted)]">
            CRM multiempresa para equipes de venda: funil por etapa, conversas do WhatsApp junto do
            lead e controle de acesso por papel.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              'Cada empresa enxerga só os próprios dados',
              'Mensagens do WhatsApp viram leads automaticamente',
              'Dono, administrador e vendedor com permissões diferentes',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent-soft)] text-[10px] text-[var(--accent)]">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[var(--muted)]">
          Feito por Henrique Otta Rodrigues · TypeScript, Node.js, PostgreSQL e Next.js
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="anim-subir w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] font-bold text-[#0a0d14]">
              P
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">Pipeline CRM</span>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight">Entrar</h2>
          <p className="mt-1.5 text-sm text-[var(--muted)]">Use o e-mail e a senha da sua empresa.</p>

          {demoDisponivel && (
            <>
              <button
                type="button"
                onClick={entrarDemo}
                disabled={entrandoDemo}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-[#0a0d14] shadow-lg shadow-[rgba(124,108,255,0.25)] transition hover:opacity-90 disabled:opacity-60"
              >
                {entrandoDemo ? 'Abrindo demonstração…' : 'Entrar como demonstração'}
                <span aria-hidden>→</span>
              </button>
              <p className="mt-2 text-center text-xs text-[var(--muted)]">
                Sem cadastro. Dados fictícios de uma revenda de veículos.
              </p>
              <div className="my-6 flex items-center gap-3 text-xs text-[var(--muted)]">
                <span className="h-px flex-1 bg-[var(--line)]" />
                ou entre com sua conta
                <span className="h-px flex-1 bg-[var(--line)]" />
              </div>
            </>
          )}

          <form onSubmit={onSubmit} className={`space-y-4 ${demoDisponivel ? '' : 'mt-8'}`}>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">E-mail</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={campo}
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">Senha</span>
              <span className="relative block">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`${campo} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute inset-y-0 right-0 mt-1.5 flex items-center px-3.5 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? 'Ocultar' : 'Ver'}
                </button>
              </span>
            </label>

            {pickingEmpresa && empresas.length > 0 && (
              <label className="block text-sm">
                <span className="text-[var(--muted)]">Empresa</span>
                <select
                  required
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  className={campo}
                >
                  <option value="">Selecione…</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome} ({emp.role})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {error && (
              <p
                className="rounded-lg bg-[rgba(248,113,113,0.1)] px-3 py-2 text-sm text-[var(--danger)]"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--accent)] disabled:opacity-60"
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
