import express from 'express';
import { upsertWhatsappConfig } from '../controllers/whatsappConfigController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
const whatsappConfigRouter = express.Router();
whatsappConfigRouter.use(authenticate);
whatsappConfigRouter.put('/config', authorize('CRM_OWNER', 'OWNER'), upsertWhatsappConfig);
export default whatsappConfigRouter;
//# sourceMappingURL=whatsappConfigRoutes.js.map