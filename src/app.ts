import express from 'express';
import usuarioRouter from './routes/usuarioRoutes.js';
import authRouter from './routes/authRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/usuarios', usuarioRouter);

app.use(errorHandler);

export default app;
