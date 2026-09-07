import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../modules/auth/auth.schema.js';
import { login as loginService } from '../services/authService.js';
import { me as meService } from '../services/meService.js';

const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dados = loginSchema.parse(req.body);
        const resultado = await loginService(dados);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error('Não autorizado');
        }

        const perfil = await meService(req.user);
        res.json(perfil);
    } catch (error) {
        next(error);
    }
};

export { login, me };
