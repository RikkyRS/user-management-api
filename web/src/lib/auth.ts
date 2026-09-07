/**
 * Legado: limpa crm_token se ainda existir de sessões antigas.
 * Sessão atual = cookie HttpOnly crm_session (JS não lê).
 */
const TOKEN_KEY = 'crm_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}
