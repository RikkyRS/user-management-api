import { Request, Response, NextFunction } from 'express';
import { lerToken } from '../lib/jwt.js';

const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const header = req.headers.authorization;

        if (!header?.startsWith('Bearer ')) {
            throw new Error('Não autorizado');
        }

        const token = header.slice('Bearer '.length);
        req.user = await lerToken(token);
        next();
    } catch {
        next(new Error('Não autorizado'));
    }
};

export default authenticate;
