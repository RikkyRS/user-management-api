import { SignJWT, jwtVerify } from 'jose';
import type { Role } from '../generated/prisma/enums.js';
import { isRole } from './roles.js';

export type TokenPayload = {
    id: string;
    role: Role;
};

const getSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }

    return new TextEncoder().encode(secret);
};

const criarToken = async (payload: TokenPayload) => {
    return new SignJWT({ role: payload.role })
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

    if (!id || !isRole(role)) {
        throw new Error('Não autorizado');
    }

    return { id, role };
};

export { criarToken, lerToken };
