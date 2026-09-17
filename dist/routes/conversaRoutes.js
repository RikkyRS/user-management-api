import express from 'express';
import { listarConversas, listarMensagens, enviarMensagem } from '../controllers/conversaController.js';
import authenticate from '../middlewares/authenticate.js';
const conversaRouter = express.Router();
conversaRouter.use(authenticate);
conversaRouter.get('/', listarConversas);
conversaRouter.get('/:leadId/mensagens', listarMensagens);
conversaRouter.post('/:leadId/mensagens', enviarMensagem);
export default conversaRouter;
//# sourceMappingURL=conversaRoutes.js.map