/** Role efetiva na request: CRM_OWNER (plataforma) ou role de membership. */
export type EffectiveRole = 'CRM_OWNER' | 'OWNER' | 'ADMIN' | 'USER';

export type MembershipRole = 'OWNER' | 'ADMIN' | 'USER';

const ROLES: readonly EffectiveRole[] = ['CRM_OWNER', 'OWNER', 'ADMIN', 'USER'];

const ROLES_STAFF: readonly EffectiveRole[] = ['CRM_OWNER', 'OWNER', 'ADMIN'];

const ROLES_ATRIBUIVEIS: readonly MembershipRole[] = ['OWNER', 'ADMIN', 'USER'];

const isRole = (value: unknown): value is EffectiveRole =>
    typeof value === 'string' && (ROLES as readonly string[]).includes(value);

const isMembershipRole = (value: unknown): value is MembershipRole =>
    typeof value === 'string' &&
    (ROLES_ATRIBUIVEIS as readonly string[]).includes(value);

const isStaff = (role: EffectiveRole) => ROLES_STAFF.includes(role);

type Ator = { id: string; role: EffectiveRole };
type Alvo = { id: string; role: EffectiveRole };

const garantirPodeAlterarRole = (
    ator: Ator,
    alvo: Alvo,
    novaRole: MembershipRole
) => {
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
    isMembershipRole,
    isStaff,
    garantirPodeAlterarRole,
    garantirPodeDeletar
};
