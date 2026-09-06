import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { criarToken } from '../lib/jwt.js';
import { MultiplasEmpresasError } from '../lib/errors.js';
import type { LoginInput } from '../modules/auth/auth.schema.js';
import type { EffectiveRole } from '../lib/roles.js';

const usuarioPublico = (usuario: {
    id: string;
    nome: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    isCrmOwner: boolean;
}, role: EffectiveRole, empresaId?: string) => ({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role,
    empresaId: empresaId ?? null,
    isCrmOwner: usuario.isCrmOwner,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt
});

const login = async (dados: LoginInput) => {
    const usuario = await prisma.usuario.findUnique({
        where: { email: dados.email }
    });

    if (!usuario) {
        throw new Error('Credenciais inválidas');
    }

    const senhaOk = await bcrypt.compare(dados.senha, usuario.senha);

    if (!senhaOk) {
        throw new Error('Credenciais inválidas');
    }

    if (usuario.isCrmOwner) {
        if (dados.empresaId) {
            const empresa = await prisma.empresa.findUnique({
                where: { id: dados.empresaId },
                select: { id: true }
            });

            if (!empresa) {
                throw new Error('Empresa não encontrada');
            }
        }

        const role: EffectiveRole = 'CRM_OWNER';
        const token = await criarToken({
            id: usuario.id,
            role,
            empresaId: dados.empresaId
        });

        return {
            token,
            usuario: usuarioPublico(usuario, role, dados.empresaId)
        };
    }

    const membros = await prisma.membroEmpresa.findMany({
        where: { usuarioId: usuario.id },
        select: {
            role: true,
            empresaId: true,
            empresa: { select: { id: true, nome: true } }
        }
    });

    if (membros.length === 0) {
        throw new Error('Credenciais inválidas');
    }

    if (dados.empresaId) {
        const membro = membros.find((m) => m.empresaId === dados.empresaId);

        if (!membro) {
            throw new Error('Acesso negado');
        }

        const role = membro.role as EffectiveRole;
        const token = await criarToken({
            id: usuario.id,
            role,
            empresaId: membro.empresaId
        });

        return {
            token,
            usuario: usuarioPublico(usuario, role, membro.empresaId)
        };
    }

    if (membros.length > 1) {
        throw new MultiplasEmpresasError(
            membros.map((m) => ({
                id: m.empresa.id,
                nome: m.empresa.nome,
                role: m.role
            }))
        );
    }

    const unico = membros[0];
    const role = unico.role as EffectiveRole;
    const token = await criarToken({
        id: usuario.id,
        role,
        empresaId: unico.empresaId
    });

    return {
        token,
        usuario: usuarioPublico(usuario, role, unico.empresaId)
    };
};

export { login };
