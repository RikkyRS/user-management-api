import { parseSessionToken } from '../lib/sessionCookie.js';
/**
 * CSRF: mutações com cookie de sessão exigem Origin/Referer ∈ CORS_ORIGIN.
 * Bearer puro (CI/Postman) sem cookie → liberado.
 */
const csrfOrigin = (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        return next();
    }
    const hasCookie = Boolean(parseSessionToken(req.headers.cookie));
    const hasBearer = Boolean(req.headers.authorization?.startsWith('Bearer '));
    if (hasBearer && !hasCookie) {
        return next();
    }
    const allowed = process.env.CORS_ORIGIN?.trim();
    if (!allowed) {
        return next();
    }
    let candidate = null;
    const origin = req.headers.origin;
    if (typeof origin === 'string' && origin.length > 0) {
        candidate = origin;
    }
    else if (typeof req.headers.referer === 'string') {
        try {
            candidate = new URL(req.headers.referer).origin;
        }
        catch {
            candidate = null;
        }
    }
    if (!candidate) {
        // API/smoke sem Origin: ok se ainda não há cookie de sessão
        if (!hasCookie) {
            return next();
        }
        return res.status(403).json({ message: 'Origin inválida' });
    }
    if (candidate !== allowed) {
        return res.status(403).json({ message: 'Origin inválida' });
    }
    return next();
};
export default csrfOrigin;
//# sourceMappingURL=csrfOrigin.js.map