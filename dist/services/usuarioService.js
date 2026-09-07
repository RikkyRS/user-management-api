import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { garantirPodeAlterarRole, garantirPodeDeletar } from '../lib/roles.js';
import { exigirEmpresaId } from '../lib/acesso.js';
import { skipTake, toPage } from '../lib/pagination.js';
const mapMembroPublico = (membro) => ({
    id: membro.usuario.id,
    nome: membro.usuario.nome,
    email: membro.usuario.email,
    role: membro.usuario.isCrmOwner ? 'CRM_OWNER' : membro.role,
    empresaId: membro.empresaId,
    isCrmOwner: membro.usuario.isCrmOwner,
    createdAt: membro.usuario.createdAt,
    updatedAt: membro.usuario.updatedAt
});
const buscarMembroNoTenant = async (empresaId, usuarioId) => {
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
const criarUsuario = async (ator, dados) => {
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
        role: 'USER',
        empresaId,
        isCrmOwner: false,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
    };
};
const listarUsuarios = async (ator, page, limit) => {
    const empresaId = exigirEmpresaId(ator);
    const where = { empresaId };
    const { skip, take } = skipTake(page, limit);
    const [total, membros] = await Promise.all([
        prisma.membroEmpresa.count({ where }),
        prisma.membroEmpresa.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'asc' },
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
        })
    ]);
    return toPage(membros.map(mapMembroPublico), total, page, limit);
};
const buscarUsuario = async (ator, id) => {
    const empresaId = exigirEmpresaId(ator);
    const membro = await buscarMembroNoTenant(empresaId, id);
    if (!membro) {
        throw new Error('Usuário não encontrado');
    }
    return mapMembroPublico(membro);
};
const garantirAlvoNoTenant = async (empresaId, id) => {
    const membro = await buscarMembroNoTenant(empresaId, id);
    if (!membro) {
        throw new Error('Usuário não encontrado');
    }
    return membro;
};
const substituirUsuario = async (ator, id, dados) => {
    const empresaId = exigirEmpresaId(ator);
    await garantirAlvoNoTenant(empresaId, id);
    const data = {
        nome: dados.nome,
        email: dados.email
    };
    if (dados.senha !== undefined) {
        data.senha = await bcrypt.hash(dados.senha, 10);
        data.tokenVersion = { increment: 1 };
    }
    await prisma.usuario.update({ where: { id }, data });
    const membro = await garantirAlvoNoTenant(empresaId, id);
    return mapMembroPublico(membro);
};
const atualizarUsuarioParcial = async (ator, id, dados) => {
    const empresaId = exigirEmpresaId(ator);
    await garantirAlvoNoTenant(empresaId, id);
    const data = {};
    if (dados.nome !== undefined)
        data.nome = dados.nome;
    if (dados.email !== undefined)
        data.email = dados.email;
    if (dados.senha !== undefined) {
        data.senha = await bcrypt.hash(dados.senha, 10);
        data.tokenVersion = { increment: 1 };
    }
    await prisma.usuario.update({ where: { id }, data });
    const membro = await garantirAlvoNoTenant(empresaId, id);
    return mapMembroPublico(membro);
};
const alterarRole = async (ator, id, novaRole) => {
    const empresaId = exigirEmpresaId(ator);
    const alvo = await garantirAlvoNoTenant(empresaId, id);
    if (alvo.usuario.isCrmOwner) {
        throw new Error('Acesso negado');
    }
    garantirPodeAlterarRole(ator, { id: alvo.usuario.id, role: alvo.role }, novaRole);
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
const deletarUsuario = async (ator, id) => {
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
export { criarUsuario, listarUsuarios, buscarUsuario, substituirUsuario, atualizarUsuarioParcial, alterarRole, deletarUsuario };
//# sourceMappingURL=usuarioService.js.map