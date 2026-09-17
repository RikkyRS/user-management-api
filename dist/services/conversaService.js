import prisma from '../lib/prisma.js';
import { exigirEmpresaId } from '../lib/acesso.js';
import { isStaff } from '../lib/roles.js';
import { skipTake, toPage } from '../lib/pagination.js';
import { normalizarTelefone } from './whatsappWebhookService.js';
const escopoLead = (ator, empresaId) => {
    if (isStaff(ator.role)) {
        return { empresaId };
    }
    return {
        empresaId,
        responsavelUsuarioId: ator.id
    };
};
const garantirPodeLerLead = (ator, lead) => {
    if (isStaff(ator.role)) {
        return;
    }
    if (lead.responsavelUsuarioId === ator.id) {
        return;
    }
    throw new Error('Acesso negado');
};
const listarConversas = async (ator) => {
    const empresaId = exigirEmpresaId(ator);
    const leads = await prisma.lead.findMany({
        where: {
            ...escopoLead(ator, empresaId),
            mensagens: { some: {} }
        },
        select: {
            id: true,
            nome: true,
            telefone: true,
            status: true,
            responsavelUsuarioId: true,
            mensagens: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    id: true,
                    texto: true,
                    direcao: true,
                    createdAt: true
                }
            }
        }
    });
    const items = leads
        .map((lead) => {
        const last = lead.mensagens[0];
        if (!last) {
            return null;
        }
        return {
            leadId: lead.id,
            nome: lead.nome,
            telefone: lead.telefone,
            status: lead.status,
            lastMessage: {
                id: last.id,
                texto: last.texto,
                direcao: last.direcao,
                createdAt: last.createdAt
            }
        };
    })
        .filter((item) => item !== null)
        .sort((a, b) => b.lastMessage.createdAt.getTime() -
        a.lastMessage.createdAt.getTime());
    return items;
};
const listarMensagens = async (ator, leadId, opts) => {
    const empresaId = exigirEmpresaId(ator);
    const lead = await prisma.lead.findFirst({
        where: { id: leadId, empresaId },
        select: { id: true, responsavelUsuarioId: true }
    });
    if (!lead) {
        throw new Error('Lead não encontrado');
    }
    garantirPodeLerLead(ator, lead);
    const where = { empresaId, leadId };
    const { skip, take } = skipTake(opts.page, opts.limit);
    const [total, data] = await Promise.all([
        prisma.mensagem.count({ where }),
        prisma.mensagem.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            skip,
            take,
            select: {
                id: true,
                empresaId: true,
                leadId: true,
                direcao: true,
                texto: true,
                waMessageId: true,
                createdAt: true
            }
        })
    ]);
    return toPage(data, total, opts.page, opts.limit);
};
const deveMockarEnvio = (accessToken) => process.env.WHATSAPP_MOCK === 'true' || !accessToken;
const enviarViaCloudApi = async (phoneNumberId, accessToken, to, texto) => {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: texto }
        })
    });
    const body = (await res.json().catch(() => null));
    if (!res.ok) {
        const detail = body?.error?.message ?? `HTTP ${res.status}`;
        throw new Error(`Falha ao enviar WhatsApp: ${detail}`);
    }
    return body?.messages?.[0]?.id ?? null;
};
const enviarMensagem = async (ator, leadId, dados) => {
    const empresaId = exigirEmpresaId(ator);
    const lead = await prisma.lead.findFirst({
        where: { id: leadId, empresaId },
        select: {
            id: true,
            telefone: true,
            responsavelUsuarioId: true
        }
    });
    if (!lead) {
        throw new Error('Lead não encontrado');
    }
    garantirPodeLerLead(ator, lead);
    const config = await prisma.whatsappConfig.findUnique({
        where: { empresaId },
        select: {
            phoneNumberId: true,
            accessToken: true
        }
    });
    if (!config) {
        throw new Error('Config WhatsApp não encontrada');
    }
    const to = normalizarTelefone(lead.telefone);
    let waMessageId = null;
    if (!deveMockarEnvio(config.accessToken)) {
        waMessageId = await enviarViaCloudApi(config.phoneNumberId, config.accessToken, to, dados.texto);
    }
    return prisma.mensagem.create({
        data: {
            empresaId,
            leadId: lead.id,
            direcao: 'OUTBOUND',
            texto: dados.texto,
            waMessageId
        },
        select: {
            id: true,
            empresaId: true,
            leadId: true,
            direcao: true,
            texto: true,
            waMessageId: true,
            createdAt: true
        }
    });
};
export { listarConversas, listarMensagens, enviarMensagem };
//# sourceMappingURL=conversaService.js.map