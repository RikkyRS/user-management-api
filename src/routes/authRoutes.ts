import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, me } from '../controllers/authController.js';
import authenticate from '../middlewares/authenticate.js';

const authRouter = express.Router();

/** Finding 008 — 100 req / 15 min / IP só no login. */
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas de login — tente novamente mais tarde' }
});

authRouter.post('/login', loginRateLimit, login);
authRouter.get('/me', authenticate, me);

export default authRouter;
