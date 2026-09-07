'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { api, ApiError } from '@/lib/api';
import type { EmpresaOption } from '@/lib/types';

export default function LoginPage() {
  const { login, me, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  /** Impede redirect enquanto o usuário escolhe empresa (caso 409). */
  const [pickingEmpresa, setPickingEmpresa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at 20% 20%, #99f6e4 0%, transparent 45%), radial-gradient(ellipse at 80% 0%, #fed7aa 0%, transparent 40%), linear-gradient(180deg, #f3f1ec, #e7e5e4)',
        }}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-sm">
        <p className="font-display text-3xl tracking-tight">CRM</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Entre com seu e-mail e senha da empresa.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">E-mail</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Senha</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>

          {pickingEmpresa && empresas.length > 0 && (
            <label className="block text-sm">
              <span className="text-[var(--muted)]">Empresa</span>
              <select
                required
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
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
            <p className="text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
