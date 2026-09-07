import prisma from '../lib/prisma.js';
const me = async (ator) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: ator.id },
        select: {
            id: true,
            nome: true,
            email: true,
            isCrmOwner: true,
            createdAt: true,
            updatedAt: true
        }
    });
    if (!usuario) {
        throw new Error('Não autorizado');
    }
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: ator.role,
        empresaId: ator.empresaId ?? null,
        isCrmOwner: usuario.isCrmOwner,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
    };
};
export { me };
//# sourceMappingURL=meService.js.map