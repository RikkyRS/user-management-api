import usuarioSchema, { usuarioPutSchema, usuarioPatchSchema } from '../modules/users/user.schema.js';
import { criarUsuario as criarUsuarioService, listarUsuarios as listarUsuariosService, buscarUsuario as buscarUsuarioService, substituirUsuario as substituirUsuarioService, atualizarUsuarioParcial as atualizarUsuarioParcialService, deletarUsuario as deletarUsuarioService } from '../services/usuarioService.js';
import { z } from 'zod';
const criarUsuario = async (req, res, next) => {
    try {
        const dados = usuarioSchema.parse(req.body);
        const usuario = await criarUsuarioService(dados);
        res.status(201).json(usuario);
    }
    catch (error) {
        next(error);
    }
};
const listarUsuario = async (req, res, next) => {
    try {
        const usuarios = await listarUsuariosService();
        res.json(usuarios);
    }
    catch (error) {
        next(error);
    }
};
const buscarUsuario = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const usuario = await buscarUsuarioService(id);
        res.json(usuario);
    }
    catch (error) {
        next(error);
    }
};
const substituirUsuario = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const dados = usuarioPutSchema.parse(req.body);
        const usuario = await substituirUsuarioService(id, dados);
        res.json(usuario);
    }
    catch (error) {
        next(error);
    }
};
const atualizarUsuarioParcial = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const dados = usuarioPatchSchema.parse(req.body);
        const usuario = await atualizarUsuarioParcialService(id, dados);
        res.json(usuario);
    }
    catch (error) {
        next(error);
    }
};
const deletarUsuario = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const resultado = await deletarUsuarioService(id);
        res.json(resultado);
    }
    catch (error) {
        next(error);
    }
};
export { criarUsuario, listarUsuario, buscarUsuario, substituirUsuario, atualizarUsuarioParcial, deletarUsuario };
//# sourceMappingURL=usuarioController.js.map