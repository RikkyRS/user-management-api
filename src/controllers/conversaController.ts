import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
    conversaMensagensQuerySchema,
    enviarMensagemSchema
} from '../modules/conversas/conversa.schema.js';
import {
    listarConversas as listarConversasService,
    listarMensagens as listarMensagensService,
    enviarMensagem as enviarMensagemService
} from '../services/conversaService.js';

const exigirUsuario = (req: Request) => {
    if (!req.user) {
        throw new Error('Não autorizado');
    }

    return req.user;
};

const listarConversas = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const data = await listarConversasService(user);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const listarMensagens = async (
    req: Request<{ leadId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const leadId = z.string().uuid().parse(req.params.leadId);
        const query = conversaMensagensQuerySchema.parse(req.query);
        const resultado = await listarMensagensService(user, leadId, query);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

const enviarMensagem = async (
    req: Request<{ leadId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const leadId = z.string().uuid().parse(req.params.leadId);
        const dados = enviarMensagemSchema.parse(req.body);
        const mensagem = await enviarMensagemService(user, leadId, dados);
        res.status(201).json(mensagem);
    } catch (error) {
        next(error);
    }
};

export { listarConversas, listarMensagens, enviarMensagem };
