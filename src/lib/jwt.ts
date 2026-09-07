import { SignJWT, jwtVerify } from 'jose';
import { isRole, type EffectiveRole } from './roles.js';

export type TokenPayload = {
    id: string;
    role: EffectiveRole;
    /** Obrigatório para OWNER/ADMIN/USER; opcional para CRM_OWNER (contexto de tenant). */
    empresaId?: string;
    /** Deve bater com Usuario.tokenVersion (Finding 007). */
    tokenVersion: number;
};

const getSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }

    return new TextEncoder().encode(secret);
};

const criarToken = async (payload: TokenPayload) => {
    const claims: Record<string, string | number> = {
        role: payload.role,
        tokenVersion: payload.tokenVersion
    };

    if (payload.empresaId) {
        claims.empresaId = payload.empresaId;
    }

    return new SignJWT(claims)
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.id)
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(getSecret());
};

const lerToken = async (token: string): Promise<TokenPayload> => {
    const { payload } = await jwtVerify(token, getSecret());
    const id = payload.sub;
    const role = payload.role;
    const empresaId =
        typeof payload.empresaId === 'string' ? payload.empresaId : undefined;
    const tokenVersion = payload.tokenVersion;

    if (
        !id ||
        !isRole(role) ||
        typeof tokenVersion !== 'number' ||
        !Number.isInteger(tokenVersion)
    ) {
        throw new Error('Não autorizado');
    }

    return { id, role, empresaId, tokenVersion };
};

export { criarToken, lerToken };
