import prisma from '../lib/prisma.js';
import type { EmpresaCreateInput } from '../modules/empresas/empresa.schema.js';

const criarEmpresa = async (dados: EmpresaCreateInput) => {
    return prisma.empresa.create({
        data: { nome: dados.nome },
        select: {
            id: true,
            nome: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

const listarEmpresas = async () => {
    return prisma.empresa.findMany({
        select: {
            id: true,
            nome: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: { createdAt: 'asc' }
    });
};

export { criarEmpresa, listarEmpresas };
