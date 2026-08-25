import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client.js';


const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof z.ZodError) {
        const errors = err.issues.map((erro) => {
            return {
                field: erro.path.join('.') || 'body',
                message: erro.message
            };
        });

        return res.status(400).json({
            message: 'Dados inválidos',
            errors
        });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                message: 'E-mail já cadastrado'
            });
        }
    }

    if (err instanceof Error && err.message === 'Usuário não encontrado') {
    return res.status(404).json({
        message: 'Usuário não encontrado'
    });
    }
    console.error(err);

    return res.status(500).json({
        message: 'Problema no sistema'
    });
};

export default errorHandler;