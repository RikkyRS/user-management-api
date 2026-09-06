import { Request, Response, NextFunction } from 'express';
import type { EffectiveRole } from '../lib/roles.js';

const authorize = (...roles: EffectiveRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new Error('Não autorizado'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new Error('Acesso negado'));
        }

        next();
    };
};

export default authorize;
