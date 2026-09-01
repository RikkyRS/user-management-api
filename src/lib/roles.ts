import type { Role } from '../generated/prisma/enums.js';

const ROLES: readonly Role[] = ['CRM_OWNER', 'OWNER', 'ADMIN', 'USER'];

const ROLES_STAFF: readonly Role[] = ['CRM_OWNER', 'OWNER', 'ADMIN'];

const ROLES_ATRIBUIVEIS: readonly Role[] = ['OWNER', 'ADMIN', 'USER'];

const isRole = (value: unknown): value is Role =>
    typeof value === 'string' && (ROLES as readonly string[]).includes(value);

const isStaff = (role: Role) => ROLES_STAFF.includes(role);

type Ator = { id: string; role: Role };
type Alvo = { id: string; role: Role };

const garantirPodeAlterarRole = (ator: Ator, alvo: Alvo, novaRole: Role) => {
    if (novaRole === 'CRM_OWNER') {
        throw new Error('Acesso negado');
    }

    if (alvo.role === 'CRM_OWNER') {
        throw new Error('Acesso negado');
    }

    if (ator.id === alvo.id) {
        throw new Error('Acesso negado');
    }

    if (ator.role === 'CRM_OWNER') {
        if (ROLES_ATRIBUIVEIS.includes(novaRole)) {
            return;
        }

        throw new Error('Acesso negado');
    }

    if (ator.role === 'OWNER') {
        if (
            (alvo.role === 'USER' || alvo.role === 'ADMIN') &&
            (novaRole === 'USER' || novaRole === 'ADMIN')
        ) {
            return;
        }

        throw new Error('Acesso negado');
    }

    throw new Error('Acesso negado');
};

const garantirPodeDeletar = (ator: Ator, alvo: Alvo) => {
    if (alvo.role === 'CRM_OWNER') {
        throw new Error('Acesso negado');
    }

    if (ator.role === 'CRM_OWNER') {
        return;
    }

    if (ator.role === 'OWNER') {
        if (alvo.role === 'ADMIN' || alvo.role === 'USER') {
            return;
        }

        throw new Error('Acesso negado');
    }

    if (ator.role === 'ADMIN') {
        if (alvo.role === 'ADMIN' || alvo.role === 'USER') {
            return;
        }

        throw new Error('Acesso negado');
    }

    throw new Error('Acesso negado');
};

export {
    ROLES,
    ROLES_STAFF,
    ROLES_ATRIBUIVEIS,
    isRole,
    isStaff,
    garantirPodeAlterarRole,
    garantirPodeDeletar
};
