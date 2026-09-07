import express from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../controllers/authController.js';

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

export default authRouter;
