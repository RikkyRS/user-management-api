import { loginSchema } from '../modules/auth/auth.schema.js';
import { login as loginService } from '../services/authService.js';
import { me as meService } from '../services/meService.js';
import { buildSessionCookie, clearSessionCookie } from '../lib/sessionCookie.js';
const login = async (req, res, next) => {
    try {
        const dados = loginSchema.parse(req.body);
        const resultado = await loginService(dados);
        res.setHeader('Set-Cookie', buildSessionCookie(resultado.token));
        // token no body: tools/CI/Bearer; browser usa cookie e não persiste
        res.json(resultado);
    }
    catch (error) {
        next(error);
    }
};
const me = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new Error('Não autorizado');
        }
        const perfil = await meService(req.user);
        res.json(perfil);
    }
    catch (error) {
        next(error);
    }
};
const logout = async (_req, res, next) => {
    try {
        res.setHeader('Set-Cookie', clearSessionCookie());
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
export { login, me, logout };
//# sourceMappingURL=authController.js.map