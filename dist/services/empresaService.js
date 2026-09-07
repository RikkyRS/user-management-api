import prisma from '../lib/prisma.js';
const empresaSelect = {
    id: true,
    nome: true,
    createdAt: true,
    updatedAt: true
};
const criarEmpresa = async (dados) => {
    return prisma.empresa.create({
        data: { nome: dados.nome },
        select: empresaSelect
    });
};
const listarEmpresas = async () => {
    return prisma.empresa.findMany({
        select: empresaSelect,
        orderBy: { createdAt: 'asc' }
    });
};
const atualizarEmpresa = async (id, dados) => {
    const existe = await prisma.empresa.findUnique({
        where: { id },
        select: { id: true }
    });
    if (!existe) {
        throw new Error('Empresa não encontrada');
    }
    return prisma.empresa.update({
        where: { id },
        data: { nome: dados.nome },
        select: empresaSelect
    });
};
export { criarEmpresa, listarEmpresas, atualizarEmpresa };
//# sourceMappingURL=empresaService.js.map