import express from 'express';
import {
    criarEmpresa,
    listarEmpresas,
    atualizarEmpresa
} from '../controllers/empresaController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const empresaRouter = express.Router();

empresaRouter.use(authenticate);
empresaRouter.use(authorize('CRM_OWNER'));

empresaRouter.get('/', listarEmpresas);
empresaRouter.post('/', criarEmpresa);
empresaRouter.patch('/:id', atualizarEmpresa);

export default empresaRouter;
