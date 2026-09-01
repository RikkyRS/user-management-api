import { Request, Response, NextFunction } from 'express';
import {
    usuarioAdminCreateSchema,
    usuarioPutSchema,
    usuarioPatchSchema,
    usuarioRolePatchSchema
} from '../modules/users/user.schema.js';
import {
    criarUsuario as criarUsuarioService,
    listarUsuarios as listarUsuariosService,
    buscarUsuario as buscarUsuarioService,
    substituirUsuario as substituirUsuarioService,
    atualizarUsuarioParcial as atualizarUsuarioParcialService,
    alterarRole as alterarRoleService,
    deletarUsuario as deletarUsuarioService
} from '../services/usuarioService.js';
import { garantirProprioOuAdmin } from '../lib/acesso.js';
import { z } from 'zod';

const exigirUsuario = (req: Request) => {
    if (!req.user) {
        throw new Error('Não autorizado');
    }

    return req.user;
};

const criarUsuario = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dados = usuarioAdminCreateSchema.parse(req.body);
        const usuario = await criarUsuarioService(dados, 'USER');
        res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
};

const listarUsuario = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const usuarios = await listarUsuariosService();
        res.json(usuarios);
    } catch (error) {
        next(error);
    }
};

const buscarUsuario = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        garantirProprioOuAdmin(user, id);
        const usuario = await buscarUsuarioService(id);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

const substituirUsuario = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        garantirProprioOuAdmin(user, id);
        const dados = usuarioPutSchema.parse(req.body);
        const usuario = await substituirUsuarioService(id, dados);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

const atualizarUsuarioParcial = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        garantirProprioOuAdmin(user, id);
        const dados = usuarioPatchSchema.parse(req.body);
        const usuario = await atualizarUsuarioParcialService(id, dados);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

const alterarRole = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        const { role } = usuarioRolePatchSchema.parse(req.body);
        const usuario = await alterarRoleService(user, id, role);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

const deletarUsuario = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = exigirUsuario(req);
        const id = z.string().uuid().parse(req.params.id);
        const resultado = await deletarUsuarioService(user, id);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
};

export {
    criarUsuario,
    listarUsuario,
    buscarUsuario,
    substituirUsuario,
    atualizarUsuarioParcial,
    alterarRole,
    deletarUsuario
};
