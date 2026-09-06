import type { EffectiveRole } from '../lib/roles.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: EffectiveRole;
                empresaId?: string;
                isCrmOwner: boolean;
            };
        }
    }
}

export {};
