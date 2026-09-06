import { Request, Response, NextFunction } from 'express';
import { empresaCreateSchema } from '../modules/empresas/empresa.schema.js';
import {
    criarEmpresa as criarEmpresaService,
    listarEmpresas as listarEmpresasService
} from '../services/empresaService.js';

const criarEmpresa = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dados = empresaCreateSchema.parse(req.body);
        const empresa = await criarEmpresaService(dados);
        res.status(201).json(empresa);
    } catch (error) {
        next(error);
    }
};

const listarEmpresas = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const empresas = await listarEmpresasService();
        res.json(empresas);
    } catch (error) {
        next(error);
    }
};

export { criarEmpresa, listarEmpresas };
