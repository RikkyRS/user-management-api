import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
    leadCreateSchema,
    leadPutSchema,
    leadPatchSchema
} from '../modules/leads/lead.schema.js';
import {
    criarLead as criarLeadService,
    listarLeads as listarLeadsService,
    buscarLead as buscarLeadService,
    substituirLead as substituirLeadService,
    atualizarLeadParcial as atualizarLeadParcialService,
    deletarLead as deletarLeadService
} from '../services/leadService.js';

const exigirUsuario = (req: Request) => {
    if (!req.user) {
        throw new Error('Não autorizado');
    }

    return req.user;
};

const criarLead = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const dados = leadCreateSchema.parse(req.body);
        const lead = await criarLeadService(user, dados);
        res.status(201).json(lead);
    } catch (error) {
        next(error);
    }
};

const listarLeads = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const leads = await listarLeadsService(user);
        res.json(leads);
    } catch (error) {
        next(error);
    }
};

const buscarLead = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        const lead = await buscarLeadService(user, id);
        res.json(lead);
    } catch (error) {
        next(error);
    }
};

const substituirLead = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        const dados = leadPutSchema.parse(req.body);
        const lead = await substituirLeadService(user, id, dados);
        res.json(lead);
    } catch (error) {
        next(error);
    }
};

const atualizarLeadParcial = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        const dados = leadPatchSchema.parse(req.body);
        const lead = await atualizarLeadParcialService(user, id, dados);
        res.json(lead);
    } catch (error) {
        next(error);
    }
};

const deletarLead = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        const resultado = await deletarLeadService(user, id);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

export {
    criarLead,
    listarLeads,
    buscarLead,
    substituirLead,
    atualizarLeadParcial,
    deletarLead
};
