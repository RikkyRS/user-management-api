import express from 'express';
import { criarUsuario, listarUsuario, buscarUsuario, substituirUsuario, atualizarUsuarioParcial, deletarUsuario } from '../controllers/usuarioController.js';
const usuarioRouter = express.Router();
usuarioRouter.post('/', criarUsuario);
usuarioRouter.get('/', listarUsuario);
usuarioRouter.get('/:id', buscarUsuario);
usuarioRouter.put('/:id', substituirUsuario);
usuarioRouter.patch('/:id', atualizarUsuarioParcial);
usuarioRouter.delete('/:id', deletarUsuario);
export default usuarioRouter;
//# sourceMappingURL=usuarioRoutes.js.map