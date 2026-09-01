import { Request, Response, NextFunction } from 'express';
import type { Role } from '../generated/prisma/enums.js';

const authorize = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
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
