'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import type { EmpresaOption, Me } from '@/lib/types';

type AuthContextValue = {
  me: Me | null;
  loading: boolean;
  login: (
    email: string,
    senha: string,
    empresaId?: string
  ) => Promise<{
    needsEmpresa: boolean;
    empresas: EmpresaOption[];
    usuario: Me | null;
  }>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshMe = useCallback(async () => {
    const perfil = await api<Me>('/auth/me');
    setMe(perfil);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        clearToken(); // aposenta localStorage legado
        await refreshMe();
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, senha: string, empresaId?: string) => {
      try {
        const result = await api<{ token?: string; usuario: Me }>('/auth/login', {
          method: 'POST',
          body: { email, senha, ...(empresaId ? { empresaId } : {}) },
          auth: false,
        });
        clearToken();
        setMe(result.usuario);
        return {
          needsEmpresa: false,
          empresas: [] as EmpresaOption[],
          usuario: result.usuario,
        };
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const body = err.body as { empresas?: EmpresaOption[] };
          return {
            needsEmpresa: true,
            empresas: body.empresas ?? [],
            usuario: null,
          };
        }
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    void (async () => {
      try {
        await api('/auth/logout', { method: 'POST', auth: false });
      } catch {
        // limpa estado local mesmo se logout falhar
      } finally {
        clearToken();
        setMe(null);
        router.replace('/login');
      }
    })();
  }, [router]);

  const value = useMemo(
    () => ({ me, loading, login, logout, refreshMe }),
    [me, loading, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
