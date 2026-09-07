import { loginSchema } from '../modules/auth/auth.schema.js';
import { login as loginService } from '../services/authService.js';
const login = async (req, res, next) => {
    try {
        const dados = loginSchema.parse(req.body);
        const resultado = await loginService(dados);
        res.json(resultado);
    }
    catch (error) {
        next(error);
    }
};
export { login };
//# sourceMappingURL=authController.js.map