import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../modules/auth/auth.schema.js';
import { login as loginService, loginDemo as loginDemoService } from '../services/authService.js';
import { demoAtivo } from '../lib/demo.js';
import { me as meService } from '../services/meService.js';
import {
    buildSessionCookie,
    clearSessionCookie
} from '../lib/sessionCookie.js';

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = loginSchema.parse(req.body);
        const resultado = await loginService(dados);
        res.setHeader('Set-Cookie', buildSessionCookie(resultado.token));
        // token no body: tools/CI/Bearer; browser usa cookie e não persiste
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

const logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.setHeader('Set-Cookie', clearSessionCookie());
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const loginDemo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        if (!demoAtivo()) {
            res.status(404).json({ message: 'Demonstração desativada' });
            return;
        }
        const resultado = await loginDemoService();
        res.setHeader('Set-Cookie', buildSessionCookie(resultado.token));
        res.json({ usuario: resultado.usuario });
    } catch (error) {
        next(error);
    }
};

const demoStatus = (_req: Request, res: Response) => {
    res.json({ ativo: demoAtivo() });
};

export { login, loginDemo, demoStatus, me, logout };
