import type { Role } from '../generated/prisma/enums.js';
import { isStaff } from './roles.js';

const garantirProprioOuAdmin = (
    user: { id: string; role: Role },
    recursoId: string
) => {
    if (isStaff(user.role) || user.id === recursoId) {
        return;
    }

    throw new Error('Acesso negado');
};

export { garantirProprioOuAdmin };
