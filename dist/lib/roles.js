const ROLES = ['CRM_OWNER', 'OWNER', 'ADMIN', 'USER'];
const ROLES_STAFF = ['CRM_OWNER', 'OWNER', 'ADMIN'];
const ROLES_ATRIBUIVEIS = ['OWNER', 'ADMIN', 'USER'];
const isRole = (value) => typeof value === 'string' && ROLES.includes(value);
const isMembershipRole = (value) => typeof value === 'string' &&
    ROLES_ATRIBUIVEIS.includes(value);
const isStaff = (role) => ROLES_STAFF.includes(role);
const garantirPodeAlterarRole = (ator, alvo, novaRole) => {
    if (alvo.role === 'CRM_OWNER') {
        throw new Error('Acesso negado');
    }
    if (ator.id === alvo.id) {
        throw new Error('Acesso negado');
    }
    if (ator.role === 'CRM_OWNER') {
        return;
    }
    if (ator.role === 'OWNER') {
        if ((alvo.role === 'USER' || alvo.role === 'ADMIN') &&
            (novaRole === 'USER' || novaRole === 'ADMIN')) {
            return;
        }
        throw new Error('Acesso negado');
    }
    throw new Error('Acesso negado');
};
const garantirPodeDeletar = (ator, alvo) => {
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
export { ROLES, ROLES_STAFF, ROLES_ATRIBUIVEIS, isRole, isMembershipRole, isStaff, garantirPodeAlterarRole, garantirPodeDeletar };
//# sourceMappingURL=roles.js.map