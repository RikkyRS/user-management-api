import prisma from '../lib/prisma.js';
import { exigirEmpresaId } from '../lib/acesso.js';
import { isStaff, type EffectiveRole } from '../lib/roles.js';
import { skipTake, toPage } from '../lib/pagination.js';
import {
    leadStatusSchema,
    type LeadCreateInput,
    type LeadPutInput,
    type LeadPatchInput
} from '../modules/leads/lead.schema.js';
import type { z } from 'zod';
import type { Prisma } from '../generated/prisma/client.js';

type LeadStatus = z.infer<typeof leadStatusSchema>;

type Ator = {
    id: string;
    role: EffectiveRole;
    empresaId?: string;
    isCrmOwner: boolean;
};

const leadSelect = {
    id: true,
    empresaId: true,
    nome: true,
    telefone: true,
    email: true,
    origem: true,
    interesse: true,
    status: true,
    responsavelUsuarioId: true,
    createdAt: true,
    updatedAt: true
} as const;

const garantirResponsavelNoTenant = async (
    empresaId: string,
    responsavelUsuarioId: string | null | undefined
) => {
    if (responsavelUsuarioId === undefined || responsavelUsuarioId === null) {
        return;
    }

    const membro = await prisma.membroEmpresa.findUnique({
        where: {
            usuarioId_empresaId: {
                usuarioId: responsavelUsuarioId,
                empresaId
            }
        },
        select: { id: true }
    });

    if (!membro) {
        const crmOwner = await prisma.usuario.findFirst({
            where: { id: responsavelUsuarioId, isCrmOwner: true },
            select: { id: true }
        });

        if (!crmOwner) {
            throw new Error('Responsável inválido para o tenant');
        }
    }
};

const escopoListagem = (ator: Ator, empresaId: string) => {
    if (isStaff(ator.role)) {
        return { empresaId };
    }

    return {
        empresaId,
        responsavelUsuarioId: ator.id
    };
};

const garantirPodeLerOuEditar = (
    ator: Ator,
    lead: { responsavelUsuarioId: string | null }
) => {
    if (isStaff(ator.role)) {
        return;
    }

    if (lead.responsavelUsuarioId === ator.id) {
        return;
    }

    throw new Error('Acesso negado');
};

const criarLead = async (ator: Ator, dados: LeadCreateInput) => {
    const empresaId = exigirEmpresaId(ator);

    if (!isStaff(ator.role)) {
        throw new Error('Acesso negado');
    }

    await garantirResponsavelNoTenant(empresaId, dados.responsavelUsuarioId);

    return prisma.lead.create({
        data: {
            empresaId,
            nome: dados.nome,
            telefone: dados.telefone,
            email: dados.email,
            origem: dados.origem,
            interesse: dados.interesse,
            status: dados.status ?? 'NOVO',
            responsavelUsuarioId: dados.responsavelUsuarioId
        },
        select: leadSelect
    });
};

const listarLeads = async (
    ator: Ator,
    opts: {
        page: number;
        limit: number;
        status?: LeadStatus;
        q?: string;
    }
) => {
    const empresaId = exigirEmpresaId(ator);
    const where: Prisma.LeadWhereInput = {
        ...escopoListagem(ator, empresaId)
    };

    if (opts.status) {
        where.status = opts.status;
    }

    if (opts.q) {
        where.OR = [
            { nome: { contains: opts.q, mode: 'insensitive' } },
            { telefone: { contains: opts.q, mode: 'insensitive' } },
            { email: { contains: opts.q, mode: 'insensitive' } }
        ];
    }

    const { skip, take } = skipTake(opts.page, opts.limit);

    const [total, data] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.findMany({
            where,
            select: leadSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })
    ]);

    return toPage(data, total, opts.page, opts.limit);
};

const buscarLead = async (ator: Ator, id: string) => {
    const empresaId = exigirEmpresaId(ator);

    const lead = await prisma.lead.findFirst({
        where: { id, empresaId },
        select: leadSelect
    });

    if (!lead) {
        throw new Error('Lead não encontrado');
    }

    garantirPodeLerOuEditar(ator, lead);
    return lead;
};

const substituirLead = async (ator: Ator, id: string, dados: LeadPutInput) => {
    const empresaId = exigirEmpresaId(ator);
    const atual = await prisma.lead.findFirst({
        where: { id, empresaId },
        select: leadSelect
    });

    if (!atual) {
        throw new Error('Lead não encontrado');
    }

    garantirPodeLerOuEditar(ator, atual);

    if (!isStaff(ator.role) && dados.responsavelUsuarioId !== undefined) {
        if (dados.responsavelUsuarioId !== ator.id) {
            throw new Error('Acesso negado');
        }
    }

    await garantirResponsavelNoTenant(empresaId, dados.responsavelUsuarioId);

    return prisma.lead.update({
        where: { id },
        data: {
            nome: dados.nome,
            telefone: dados.telefone,
            email: dados.email === undefined ? undefined : dados.email,
            origem: dados.origem === undefined ? undefined : dados.origem,
            interesse:
                dados.interesse === undefined ? undefined : dados.interesse,
            status: dados.status,
            responsavelUsuarioId:
                dados.responsavelUsuarioId === undefined
                    ? undefined
                    : dados.responsavelUsuarioId
        },
        select: leadSelect
    });
};

const atualizarLeadParcial = async (
    ator: Ator,
    id: string,
    dados: LeadPatchInput
) => {
    const empresaId = exigirEmpresaId(ator);
    const atual = await prisma.lead.findFirst({
        where: { id, empresaId },
        select: leadSelect
    });

    if (!atual) {
        throw new Error('Lead não encontrado');
    }

    garantirPodeLerOuEditar(ator, atual);

    if (!isStaff(ator.role) && dados.responsavelUsuarioId !== undefined) {
        if (dados.responsavelUsuarioId !== ator.id) {
            throw new Error('Acesso negado');
        }
    }

    await garantirResponsavelNoTenant(empresaId, dados.responsavelUsuarioId);

    return prisma.lead.update({
        where: { id },
        data: {
            ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
            ...(dados.telefone !== undefined
                ? { telefone: dados.telefone }
                : {}),
            ...(dados.email !== undefined ? { email: dados.email } : {}),
            ...(dados.origem !== undefined ? { origem: dados.origem } : {}),
            ...(dados.interesse !== undefined
                ? { interesse: dados.interesse }
                : {}),
            ...(dados.status !== undefined ? { status: dados.status } : {}),
            ...(dados.responsavelUsuarioId !== undefined
                ? { responsavelUsuarioId: dados.responsavelUsuarioId }
                : {})
        },
        select: leadSelect
    });
};

const deletarLead = async (ator: Ator, id: string) => {
    const empresaId = exigirEmpresaId(ator);

    if (!isStaff(ator.role)) {
        throw new Error('Acesso negado');
    }

    const lead = await prisma.lead.findFirst({
        where: { id, empresaId },
        select: { id: true }
    });

    if (!lead) {
        throw new Error('Lead não encontrado');
    }

    await prisma.lead.delete({ where: { id } });

    return { mensagem: 'Lead deletado com sucesso' };
};

export {
    criarLead,
    listarLeads,
    buscarLead,
    substituirLead,
    atualizarLeadParcial,
    deletarLead
};
