import crypto from 'node:crypto';
import prisma from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
const normalizarTelefone = (valor) => valor.replace(/\D/g, '');
const timingSafeEqualHex = (a, b) => {
    try {
        const bufA = Buffer.from(a, 'utf8');
        const bufB = Buffer.from(b, 'utf8');
        if (bufA.length !== bufB.length) {
            return false;
        }
        return crypto.timingSafeEqual(bufA, bufB);
    }
    catch {
        return false;
    }
};
const verificarAssinatura = (rawBody, appSecret, signatureHeader) => {
    if (!signatureHeader?.startsWith('sha256=')) {
        return false;
    }
    const expected = 'sha256=' +
        crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    return timingSafeEqualHex(expected, signatureHeader);
};
const processarMensagemTexto = async (empresaId, msg, contacts) => {
    if (msg.type !== 'text' || !msg.text?.body || !msg.from || !msg.id) {
        return;
    }
    const telefone = normalizarTelefone(msg.from);
    if (!telefone) {
        return;
    }
    const profileName = contacts?.find((c) => normalizarTelefone(c.wa_id ?? '') === telefone)?.profile?.name;
    const nome = profileName && profileName.trim().length > 0
        ? profileName.trim()
        : telefone;
    const lead = await prisma.lead.upsert({
        where: {
            empresaId_telefone: { empresaId, telefone }
        },
        create: {
            empresaId,
            nome,
            telefone,
            origem: 'whatsapp',
            status: 'NOVO'
        },
        update: {},
        select: { id: true }
    });
    try {
        await prisma.mensagem.create({
            data: {
                empresaId,
                leadId: lead.id,
                direcao: 'INBOUND',
                texto: msg.text.body,
                waMessageId: msg.id
            }
        });
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002') {
            return;
        }
        throw err;
    }
};
const processarPayload = async (payload) => {
    if (!payload || typeof payload !== 'object') {
        return;
    }
    const entry = payload.entry;
    if (!Array.isArray(entry)) {
        return;
    }
    for (const item of entry) {
        const changes = item?.changes;
        if (!Array.isArray(changes)) {
            continue;
        }
        for (const change of changes) {
            const value = change?.value;
            if (!value) {
                continue;
            }
            const phoneNumberId = value.metadata?.phone_number_id;
            if (!phoneNumberId) {
                continue;
            }
            const config = await prisma.whatsappConfig.findUnique({
                where: { phoneNumberId },
                select: { empresaId: true }
            });
            if (!config) {
                console.log(`[whatsapp] phone_number_id desconhecido: ${phoneNumberId}`);
                continue;
            }
            const messages = value.messages ?? [];
            for (const msg of messages) {
                await processarMensagemTexto(config.empresaId, msg, value.contacts);
            }
        }
    }
};
const verificarWebhook = async (verifyToken) => {
    const config = await prisma.whatsappConfig.findFirst({
        where: { verifyToken },
        select: { id: true }
    });
    return Boolean(config);
};
const processarWebhookPost = async (rawBody, signatureHeader) => {
    let payload;
    try {
        payload = JSON.parse(rawBody.toString('utf8'));
    }
    catch {
        return;
    }
    const phoneNumberId = extrairPhoneNumberId(payload);
    if (!phoneNumberId) {
        return;
    }
    const config = await prisma.whatsappConfig.findUnique({
        where: { phoneNumberId },
        select: { appSecret: true }
    });
    if (!config) {
        console.log(`[whatsapp] config ausente para phone_number_id: ${phoneNumberId}`);
        return;
    }
    if (!verificarAssinatura(rawBody, config.appSecret, signatureHeader)) {
        throw new Error('Assinatura WhatsApp inválida');
    }
    await processarPayload(payload);
};
const extrairPhoneNumberId = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const entry = payload.entry;
    if (!Array.isArray(entry)) {
        return null;
    }
    for (const item of entry) {
        const changes = item?.changes;
        if (!Array.isArray(changes)) {
            continue;
        }
        for (const change of changes) {
            const id = change?.value?.metadata
                ?.phone_number_id;
            if (typeof id === 'string' && id.length > 0) {
                return id;
            }
        }
    }
    return null;
};
export { normalizarTelefone, verificarWebhook, processarWebhookPost, verificarAssinatura };
//# sourceMappingURL=whatsappWebhookService.js.map