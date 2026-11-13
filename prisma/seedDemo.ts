import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import type { PrismaClient } from '../src/generated/prisma/client.js';
import { DEMO_EMAIL, DEMO_EMPRESA_ID, DEMO_USUARIO_ID } from '../src/lib/demo.js';

type Status =
    | 'NOVO'
    | 'EM_ATENDIMENTO'
    | 'QUALIFICADO'
    | 'PROPOSTA'
    | 'NEGOCIACAO'
    | 'CLIENTE'
    | 'PERDIDO';

type LeadDemo = {
    nome: string;
    telefone: string;
    email?: string;
    origem: string;
    interesse: string;
    status: Status;
    diasAtras: number;
    conversa?: Array<[direcao: 'INBOUND' | 'OUTBOUND', texto: string]>;
};

// Dados 100% fictícios (nomes e telefones inventados).
const LEADS: LeadDemo[] = [
    { nome: 'Marina Costa', telefone: '5551990010001', email: 'marina.costa@exemplo.com', origem: 'whatsapp', interesse: 'SUV até R$ 120 mil', status: 'NOVO', diasAtras: 0,
      conversa: [['INBOUND', 'Oi! Vi o Compass no Instagram, ainda está disponível?'], ['OUTBOUND', 'Oi, Marina! Está sim. Quer agendar um test drive para amanhã?'], ['INBOUND', 'Quero! Pode ser às 10h?']] },
    { nome: 'Rafael Moura', telefone: '5551990010002', origem: 'Webmotors', interesse: 'Hatch automático', status: 'EM_ATENDIMENTO', diasAtras: 1,
      conversa: [['INBOUND', 'Bom dia, o HB20 aceita troca?'], ['OUTBOUND', 'Bom dia, Rafael! Aceita sim. Qual carro você tem hoje?'], ['INBOUND', 'Um Gol 2016, 90 mil km.']] },
    { nome: 'Juliana Prates', telefone: '5551990010003', email: 'ju.prates@exemplo.com', origem: 'site', interesse: 'Sedã para aplicativo', status: 'QUALIFICADO', diasAtras: 2 },
    { nome: 'Carlos Henrique Dias', telefone: '5551990010004', origem: 'OLX', interesse: 'Picape diesel', status: 'PROPOSTA', diasAtras: 3,
      conversa: [['OUTBOUND', 'Carlos, segue a proposta da S10 com entrada de 30%.'], ['INBOUND', 'Recebi. Consegue melhorar a taxa?']] },
    { nome: 'Fernanda Lopes', telefone: '5551990010005', email: 'fernanda.lopes@exemplo.com', origem: 'indicação', interesse: 'Primeiro carro', status: 'NEGOCIACAO', diasAtras: 4 },
    { nome: 'Bruno Teixeira', telefone: '5551990010006', origem: 'whatsapp', interesse: 'Corolla 2022', status: 'CLIENTE', diasAtras: 6,
      conversa: [['INBOUND', 'Fechado! Passo amanhã para assinar.'], ['OUTBOUND', 'Perfeito, Bruno. Te espero às 14h!']] },
    { nome: 'Patrícia Nunes', telefone: '5551990010007', origem: 'Instagram', interesse: 'SUV compacto', status: 'PERDIDO', diasAtras: 8 },
    { nome: 'Diego Ramos', telefone: '5551990010008', origem: 'Webmotors', interesse: 'Moto 300cc', status: 'NOVO', diasAtras: 0 },
    { nome: 'Aline Martins', telefone: '5551990010009', email: 'aline.m@exemplo.com', origem: 'site', interesse: 'Financiamento sem entrada', status: 'EM_ATENDIMENTO', diasAtras: 1 },
    { nome: 'Gustavo Pereira', telefone: '5551990010010', origem: 'OLX', interesse: 'Onix Plus', status: 'QUALIFICADO', diasAtras: 2 },
    { nome: 'Camila Rocha', telefone: '5551990010011', origem: 'whatsapp', interesse: 'Troca com troco', status: 'PROPOSTA', diasAtras: 5 },
    { nome: 'Thiago Almeida', telefone: '5551990010012', email: 'thiago.almeida@exemplo.com', origem: 'indicação', interesse: 'Frota para empresa', status: 'CLIENTE', diasAtras: 9 }
];

/**
 * Recria a empresa de demonstração do zero a cada execução: assim, o que um
 * visitante mudar some no próximo deploy (ou na próxima execução do seed).
 */
export const seedDemo = async (prisma: PrismaClient) => {
    await prisma.empresa.upsert({
        where: { id: DEMO_EMPRESA_ID },
        create: { id: DEMO_EMPRESA_ID, nome: 'Revenda Aurora (demonstração)' },
        update: { nome: 'Revenda Aurora (demonstração)' }
    });

    // Senha aleatória e descartada: ninguém entra na conta demo por senha,
    // só pelo botão "Entrar como demonstração" (POST /auth/demo).
    const senhaDescartavel = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    await prisma.usuario.upsert({
        where: { id: DEMO_USUARIO_ID },
        create: { id: DEMO_USUARIO_ID, nome: 'Visitante (demo)', email: DEMO_EMAIL, senha: senhaDescartavel },
        update: { nome: 'Visitante (demo)', email: DEMO_EMAIL, senha: senhaDescartavel }
    });

    // Limpa o que visitantes criaram e recoloca os dados de exemplo.
    await prisma.membroEmpresa.deleteMany({
        where: { empresaId: DEMO_EMPRESA_ID, usuarioId: { not: DEMO_USUARIO_ID } }
    });
    await prisma.mensagem.deleteMany({ where: { empresaId: DEMO_EMPRESA_ID } });
    await prisma.lead.deleteMany({ where: { empresaId: DEMO_EMPRESA_ID } });

    await prisma.membroEmpresa.upsert({
        where: { usuarioId_empresaId: { usuarioId: DEMO_USUARIO_ID, empresaId: DEMO_EMPRESA_ID } },
        create: { usuarioId: DEMO_USUARIO_ID, empresaId: DEMO_EMPRESA_ID, role: 'ADMIN' },
        update: { role: 'ADMIN' }
    });

    const agora = Date.now();
    const DIA = 24 * 60 * 60 * 1000;

    for (const [i, l] of LEADS.entries()) {
        const criadoEm = new Date(agora - l.diasAtras * DIA - i * 37 * 60 * 1000);
        const lead = await prisma.lead.create({
            data: {
                empresaId: DEMO_EMPRESA_ID,
                nome: l.nome,
                telefone: l.telefone,
                email: l.email,
                origem: l.origem,
                interesse: l.interesse,
                status: l.status,
                responsavelUsuarioId: i % 2 === 0 ? DEMO_USUARIO_ID : null,
                createdAt: criadoEm
            },
            select: { id: true }
        });

        for (const [j, [direcao, texto]] of (l.conversa ?? []).entries()) {
            await prisma.mensagem.create({
                data: {
                    empresaId: DEMO_EMPRESA_ID,
                    leadId: lead.id,
                    direcao,
                    texto,
                    createdAt: new Date(criadoEm.getTime() + (j + 1) * 4 * 60 * 1000)
                }
            });
        }
    }

    console.log(`Demo recriada: ${LEADS.length} leads na empresa ${DEMO_EMPRESA_ID}`);
};
