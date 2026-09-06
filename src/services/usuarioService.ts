import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import type {
    UsuarioCreateInput,
    UsuarioPutInput,
    UsuarioPatchInput
} from '../modules/users/user.schema.js';
import {
    garantirPodeAlterarRole,
    garantirPodeDeletar,
    type EffectiveRole,
    type MembershipRole
} from '../lib/roles.js';
import { exigirEmpresaId } from '../lib/acesso.js';

type Ator = {
    id: string;
    role: EffectiveRole;
    empresaId?: string;
    isCrmOwner: boolean;
};

const mapMembroPublico = (membro: {
    role: MembershipRole;
    empresaId: string;
    usuario: {
        id: string;
        nome: string;
        email: string;
        isCrmOwner: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}) => ({
    id: membro.usuario.id,
    nome: membro.usuario.nome,
    email: membro.usuario.email,
    role: membro.usuario.isCrmOwner ? ('CRM_OWNER' as const) : membro.role,
    empresaId: membro.empresaId,
    isCrmOwner: membro.usuario.isCrmOwner,
    createdAt: membro.usuario.createdAt,
    updatedAt: membro.usuario.updatedAt
});

const buscarMembroNoTenant = async (empresaId: string, usuarioId: string) => {
    return prisma.membroEmpresa.findUnique({
        where: {
            usuarioId_empresaId: { usuarioId, empresaId }
        },
        select: {
            role: true,
            empresaId: true,
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    isCrmOwner: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    });
};

const criarUsuario = async (ator: Ator, dados: UsuarioCreateInput) => {
    const empresaId = exigirEmpresaId(ator);
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome: dados.nome,
            email: dados.email,
            senha: senhaHash,
            membros: {
                create: {
                    empresaId,
                    role: 'USER'
                }
            }
        },
        select: {
            id: true,
            nome: true,
            email: true,
            isCrmOwner: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: 'USER' as const,
        empresaId,
        isCrmOwner: false,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
    };
};

const listarUsuarios = async (ator: Ator) => {
    const empresaId = exigirEmpresaId(ator);

    const membros = await prisma.membroEmpresa.findMany({
        where: { empresaId },
        select: {
            role: true,
            empresaId: true,
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    isCrmOwner: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    });

    return membros.map(mapMembroPublico);
};

const buscarUsuario = async (ator: Ator, id: string) => {
    const empresaId = exigirEmpresaId(ator);
    const membro = await buscarMembroNoTenant(empresaId, id);

    if (!membro) {
        throw new Error('Usuário não encontrado');
    }

    return mapMembroPublico(membro);
};

const garantirAlvoNoTenant = async (empresaId: string, id: string) => {
    const membro = await buscarMembroNoTenant(empresaId, id);

    if (!membro) {
        throw new Error('Usuário não encontrado');
    }

    return membro;
};

const substituirUsuario = async (
    ator: Ator,
    id: string,
    dados: UsuarioPutInput
) => {
    const empresaId = exigirEmpresaId(ator);
    await garantirAlvoNoTenant(empresaId, id);

    const data: { nome: string; email: string; senha?: string } = {
        nome: dados.nome,
        email: dados.email
    };

    if (dados.senha !== undefined) {
        data.senha = await bcrypt.hash(dados.senha, 10);
    }

    await prisma.usuario.update({ where: { id }, data });
    const membro = await garantirAlvoNoTenant(empresaId, id);
    return mapMembroPublico(membro);
};

const atualizarUsuarioParcial = async (
    ator: Ator,
    id: string,
    dados: UsuarioPatchInput
) => {
    const empresaId = exigirEmpresaId(ator);
    await garantirAlvoNoTenant(empresaId, id);

    const data: { nome?: string; email?: string; senha?: string } = {};

    if (dados.nome !== undefined) data.nome = dados.nome;
    if (dados.email !== undefined) data.email = dados.email;
    if (dados.senha !== undefined) {
        data.senha = await bcrypt.hash(dados.senha, 10);
    }

    await prisma.usuario.update({ where: { id }, data });
    const membro = await garantirAlvoNoTenant(empresaId, id);
    return mapMembroPublico(membro);
};

const alterarRole = async (
    ator: Ator,
    id: string,
    novaRole: MembershipRole
) => {
    const empresaId = exigirEmpresaId(ator);
    const alvo = await garantirAlvoNoTenant(empresaId, id);

    if (alvo.usuario.isCrmOwner) {
        throw new Error('Acesso negado');
    }

    garantirPodeAlterarRole(
        ator,
        { id: alvo.usuario.id, role: alvo.role },
        novaRole
    );

    await prisma.membroEmpresa.update({
        where: {
            usuarioId_empresaId: { usuarioId: id, empresaId }
        },
        data: { role: novaRole }
    });

    const atualizado = await garantirAlvoNoTenant(empresaId, id);
    return mapMembroPublico(atualizado);
};

/**
 * Remove membership no tenant. Se não restar membership e não for CRM_OWNER,
 * apaga a conta — token daquele tenant (e da conta) morre no authenticate.
 */
const deletarUsuario = async (ator: Ator, id: string) => {
    const empresaId = exigirEmpresaId(ator);
    const alvo = await garantirAlvoNoTenant(empresaId, id);

    if (alvo.usuario.isCrmOwner) {
        throw new Error('Acesso negado');
    }

    garantirPodeDeletar(ator, {
        id: alvo.usuario.id,
        role: alvo.role
    });

    await prisma.membroEmpresa.delete({
        where: {
            usuarioId_empresaId: { usuarioId: id, empresaId }
        }
    });

    const restantes = await prisma.membroEmpresa.count({
        where: { usuarioId: id }
    });

    if (restantes === 0) {
        await prisma.usuario.delete({ where: { id } });
    }

    return { mensagem: 'Usuário deletado com sucesso' };
};

export {
    criarUsuario,
    listarUsuarios,
    buscarUsuario,
    substituirUsuario,
    atualizarUsuarioParcial,
    alterarRole,
    deletarUsuario
};
