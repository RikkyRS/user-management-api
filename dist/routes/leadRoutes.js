import express from 'express';
import { criarLead, listarLeads, buscarLead, substituirLead, atualizarLeadParcial, deletarLead } from '../controllers/leadController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { ROLES_STAFF } from '../lib/roles.js';
const leadRouter = express.Router();
leadRouter.use(authenticate);
leadRouter.post('/', authorize(...ROLES_STAFF), criarLead);
leadRouter.get('/', listarLeads);
leadRouter.get('/:id', buscarLead);
leadRouter.put('/:id', substituirLead);
leadRouter.patch('/:id', atualizarLeadParcial);
leadRouter.delete('/:id', authorize(...ROLES_STAFF), deletarLead);
export default leadRouter;
//# sourceMappingURL=leadRoutes.js.map