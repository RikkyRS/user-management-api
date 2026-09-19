const BEARER_KEY = 'crm_bearer';

export function getBearer(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(BEARER_KEY);
}

export function setBearer(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.sessionStorage.removeItem(BEARER_KEY);
    return;
  }
  window.sessionStorage.setItem(BEARER_KEY, token);
}

export function clearBearer(): void {
  setBearer(null);
}
