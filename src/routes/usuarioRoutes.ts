import express from 'express';
import {
    criarUsuario,
    listarUsuario,
    buscarUsuario,
    substituirUsuario,
    atualizarUsuarioParcial,
    alterarRole,
    deletarUsuario
} from '../controllers/usuarioController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { ROLES_STAFF } from '../lib/roles.js';

const usuarioRouter = express.Router();

usuarioRouter.use(authenticate);

usuarioRouter.post('/', authorize(...ROLES_STAFF), criarUsuario);
usuarioRouter.get('/', authorize(...ROLES_STAFF), listarUsuario);
usuarioRouter.get('/:id', buscarUsuario);
usuarioRouter.put('/:id', substituirUsuario);
usuarioRouter.patch('/:id/role', alterarRole);
usuarioRouter.patch('/:id', atualizarUsuarioParcial);
usuarioRouter.delete('/:id', authorize(...ROLES_STAFF), deletarUsuario);

export default usuarioRouter;
