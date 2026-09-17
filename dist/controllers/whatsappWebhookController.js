import { verificarWebhook, processarWebhookPost } from '../services/whatsappWebhookService.js';
const verifyGet = async (req, res, next) => {
    try {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode === 'subscribe' &&
            typeof token === 'string' &&
            typeof challenge === 'string') {
            const ok = await verificarWebhook(token);
            if (ok) {
                return res.status(200).type('text/plain').send(challenge);
            }
        }
        return res.status(403).send('Forbidden');
    }
    catch (error) {
        next(error);
    }
};
const receivePost = async (req, res, next) => {
    try {
        const rawBody = Buffer.isBuffer(req.body)
            ? req.body
            : Buffer.from(JSON.stringify(req.body ?? {}));
        const signature = req.headers['x-hub-signature-256'];
        const signatureHeader = typeof signature === 'string' ? signature : undefined;
        try {
            await processarWebhookPost(rawBody, signatureHeader);
        }
        catch (err) {
            if (err instanceof Error &&
                err.message === 'Assinatura WhatsApp inválida') {
                return res.status(403).json({ message: 'Assinatura inválida' });
            }
            throw err;
        }
        // Responder 200 rápido; erros de config/phone já engolidos no service
        return res.status(200).json({ ok: true });
    }
    catch (error) {
        next(error);
    }
};
export { verifyGet, receivePost };
//# sourceMappingURL=whatsappWebhookController.js.map