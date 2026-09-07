import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import usuarioRouter from './routes/usuarioRoutes.js';
import authRouter from './routes/authRoutes.js';
import empresaRouter from './routes/empresaRoutes.js';
import leadRouter from './routes/leadRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN?.trim();
app.use(
    cors({
        origin: corsOrigin && corsOrigin.length > 0 ? corsOrigin : false,
        credentials: true
    })
);

app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/empresas', empresaRouter);
app.use('/usuarios', usuarioRouter);
app.use('/leads', leadRouter);

app.use(errorHandler);

export default app;
