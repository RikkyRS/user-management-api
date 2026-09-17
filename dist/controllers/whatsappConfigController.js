import { whatsappConfigUpsertSchema } from '../modules/whatsapp/whatsapp.schema.js';
import { upsertConfig as upsertConfigService } from '../services/whatsappConfigService.js';
const exigirUsuario = (req) => {
    if (!req.user) {
        throw new Error('Não autorizado');
    }
    return req.user;
};
const upsertWhatsappConfig = async (req, res, next) => {
    try {
        const user = exigirUsuario(req);
        const dados = whatsappConfigUpsertSchema.parse(req.body);
        const config = await upsertConfigService(user, dados);
        res.json(config);
    }
    catch (error) {
        next(error);
    }
};
export { upsertWhatsappConfig };
//# sourceMappingURL=whatsappConfigController.js.map