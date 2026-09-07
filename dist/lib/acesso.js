import { isStaff } from './roles.js';
const garantirProprioOuAdmin = (user, recursoId) => {
    if (isStaff(user.role) || user.id === recursoId) {
        return;
    }
    throw new Error('Acesso negado');
};
const exigirEmpresaId = (user) => {
    if (!user.empresaId) {
        throw new Error('Contexto de empresa obrigatório');
    }
    return user.empresaId;
};
export { garantirProprioOuAdmin, exigirEmpresaId };
//# sourceMappingURL=acesso.js.map