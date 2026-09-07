import prisma from '../lib/prisma.js';
const criarEmpresa = async (dados) => {
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
//# sourceMappingURL=empresaService.js.map