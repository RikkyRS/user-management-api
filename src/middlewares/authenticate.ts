import { Request, Response, NextFunction } from 'express';
import { lerToken } from '../lib/jwt.js';
import prisma from '../lib/prisma.js';
import type { EffectiveRole } from '../lib/roles.js';
import { parseSessionToken } from '../lib/sessionCookie.js';

function extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        const bearer = header.slice('Bearer '.length).trim();
        if (bearer) return bearer;
    }

    return parseSessionToken(req.headers.cookie);
}

/**
 * Sessão viva: JWT só prova identidade + contexto.
 * Aceita Authorization Bearer (tools/CI) ou cookie HttpOnly crm_session (browser).
 * Delete de usuário ou perda de membership → 401 na próxima request.
 * Troca de senha (tokenVersion) → 401 (Finding 007).
 * Role efetiva sempre vem do banco (não confia só no claim).
 */
const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const token = extractToken(req);

        if (!token) {
            throw new Error('Não autorizado');
        }

        const claims = await lerToken(token);

        const usuario = await prisma.usuario.findUnique({
            where: { id: claims.id },
            select: { id: true, isCrmOwner: true, tokenVersion: true }
        });

        if (!usuario) {
            throw new Error('Não autorizado');
        }

        if (claims.tokenVersion !== usuario.tokenVersion) {
            throw new Error('Não autorizado');
        }

        if (usuario.isCrmOwner) {
            if (claims.empresaId) {
                const empresa = await prisma.empresa.findUnique({
                    where: { id: claims.empresaId },
                    select: { id: true }
                });

                if (!empresa) {
                    throw new Error('Não autorizado');
                }
            }

            req.user = {
                id: usuario.id,
                role: 'CRM_OWNER',
                empresaId: claims.empresaId,
                isCrmOwner: true
            };
            return next();
        }

        if (!claims.empresaId) {
            throw new Error('Não autorizado');
        }

        const membro = await prisma.membroEmpresa.findUnique({
            where: {
                usuarioId_empresaId: {
                    usuarioId: usuario.id,
                    empresaId: claims.empresaId
                }
            },
            select: { role: true, empresaId: true }
        });

        if (!membro) {
            throw new Error('Não autorizado');
        }

        req.user = {
            id: usuario.id,
            role: membro.role as EffectiveRole,
            empresaId: membro.empresaId,
            isCrmOwner: false
        };
        next();
    } catch {
        next(new Error('Não autorizado'));
    }
};

export default authenticate;
