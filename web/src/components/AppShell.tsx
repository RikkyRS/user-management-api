'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const DEMO_EMAIL = 'demo@crm.demo';

const links = [
  {
    href: '/dashboard',
    label: 'Visão geral',
    icon: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z',
  },
  {
    href: '/leads',
    label: 'Leads',
    icon: 'M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM8 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4ZM8 15c-.3 0-.7 0-1.1.1A4.7 4.7 0 0 1 9 19v2H1v-2c0-2.2 4.5-4 7-4Z',
  },
  {
    href: '/conversas',
    label: 'Conversas',
    icon: 'M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2Z',
  },
];

const papel: Record<string, string> = {
  CRM_OWNER: 'Dono da plataforma',
  OWNER: 'Dono',
  ADMIN: 'Administrador',
  USER: 'Vendedor',
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { me, logout } = useAuth();
  const demo = me?.email === DEMO_EMAIL;
  const iniciais = (me?.nome ?? '?')
    .replace(/[^\p{L}\s]/gu, '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] md:flex">
      <aside className="border-b border-[var(--line)] bg-[var(--surface)] md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-sm font-bold text-[#0a0d14]">
            P
          </span>
          <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight">
            Pipeline CRM
          </Link>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {links.map((link) => {
            const ativo = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                  ativo
                    ? 'bg-[var(--accent-soft)] text-[var(--ink)]'
                    : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 ${ativo ? 'fill-[var(--accent)]' : 'fill-current'}`}
                  aria-hidden
                >
                  <path d={link.icon} />
                </svg>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-[var(--line)] p-4 md:block">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-xs font-semibold">
              {iniciais}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{me?.nome}</p>
              <p className="truncate text-xs text-[var(--muted)]">
                {me?.role ? papel[me.role] ?? me.role : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--ink)]"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {demo && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--accent-soft)] px-6 py-2.5 text-sm">
            <p>
              <span className="font-semibold">Modo demonstração.</span>{' '}
              <span className="text-[var(--muted)]">
                Os dados são fictícios e voltam ao original a cada atualização do sistema. Fique à
                vontade para mexer.
              </span>
            </p>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline md:hidden"
            >
              Sair
            </button>
          </div>
        )}
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
