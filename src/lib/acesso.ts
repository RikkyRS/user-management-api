import type { EffectiveRole } from './roles.js';
import { isStaff } from './roles.js';

const garantirProprioOuAdmin = (
    user: { id: string; role: EffectiveRole },
    recursoId: string
) => {
    if (isStaff(user.role) || user.id === recursoId) {
        return;
    }

    throw new Error('Acesso negado');
};

const exigirEmpresaId = (user: { empresaId?: string }) => {
    if (!user.empresaId) {
        throw new Error('Contexto de empresa obrigatório');
    }

    return user.empresaId;
};

export { garantirProprioOuAdmin, exigirEmpresaId };
