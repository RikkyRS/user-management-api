import express from 'express';
import usuarioRouter from './routes/usuarioRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/usuarios', usuarioRouter);

app.use(errorHandler);

export default app;