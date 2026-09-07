/** Cookie de sessão HttpOnly — espelha TTL do JWT (8h). */
export const SESSION_COOKIE = 'crm_session';
export const SESSION_MAX_AGE_SEC = 8 * 60 * 60;
function sameSiteAttr() {
    const raw = (process.env.COOKIE_SAMESITE ?? 'none').toLowerCase();
    if (raw === 'lax')
        return 'Lax';
    if (raw === 'strict')
        return 'Strict';
    return 'None';
}
function secureFlag(sameSite) {
    if (sameSite === 'None')
        return true;
    return (process.env.COOKIE_SECURE === 'true' ||
        process.env.NODE_ENV === 'production');
}
export function parseSessionToken(cookieHeader) {
    if (!cookieHeader)
        return null;
    for (const part of cookieHeader.split(';')) {
        const trimmed = part.trim();
        const eq = trimmed.indexOf('=');
        if (eq <= 0)
            continue;
        const name = trimmed.slice(0, eq);
        if (name !== SESSION_COOKIE)
            continue;
        return decodeURIComponent(trimmed.slice(eq + 1));
    }
    return null;
}
export function buildSessionCookie(token) {
    const sameSite = sameSiteAttr();
    const parts = [
        `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        `Max-Age=${SESSION_MAX_AGE_SEC}`,
        `SameSite=${sameSite}`
    ];
    if (secureFlag(sameSite)) {
        parts.push('Secure');
    }
    return parts.join('; ');
}
export function clearSessionCookie() {
    const sameSite = sameSiteAttr();
    const parts = [
        `${SESSION_COOKIE}=`,
        'Path=/',
        'HttpOnly',
        'Max-Age=0',
        `SameSite=${sameSite}`
    ];
    if (secureFlag(sameSite)) {
        parts.push('Secure');
    }
    return parts.join('; ');
}
//# sourceMappingURL=sessionCookie.js.map