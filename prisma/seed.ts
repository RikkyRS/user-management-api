import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL é obrigatório para o seed');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString })
});

const seed = async () => {
    let empresa = await prisma.empresa.findFirst({
        orderBy: { createdAt: 'asc' }
    });

    if (!empresa) {
        empresa = await prisma.empresa.create({
            data: { nome: process.env.EMPRESA_DEMO_NOME ?? 'Empresa Demo' }
        });
        console.log(`Empresa demo criada: ${empresa.nome} (${empresa.id})`);
    } else {
        console.log(`Empresa demo: ${empresa.nome} (${empresa.id})`);
    }

    const existente = await prisma.usuario.findFirst({
        where: { isCrmOwner: true }
    });

    if (existente) {
        console.log(`CRM_OWNER já existe: ${existente.email}`);
        console.log(
            `Login com contexto: POST /auth/login { email, senha, empresaId: "${empresa.id}" }`
        );
        return;
    }

    const email = process.env.CRM_OWNER_EMAIL;
    const senha = process.env.CRM_OWNER_PASSWORD;
    const nome = process.env.CRM_OWNER_NOME ?? 'Dono do CRM';

    if (!email) {
        console.log(
            'Nenhum CRM_OWNER. Defina CRM_OWNER_EMAIL (+ PASSWORD) e rode o seed.'
        );
        return;
    }

    const porEmail = await prisma.usuario.findUnique({
        where: { email }
    });

    if (porEmail) {
        await prisma.usuario.update({
            where: { id: porEmail.id },
            data: { isCrmOwner: true }
        });
        console.log(`Usuário existente promovido a CRM_OWNER: ${email}`);
        console.log(
            `Login com contexto: POST /auth/login { email, senha, empresaId: "${empresa.id}" }`
        );
        return;
    }

    if (!senha) {
        throw new Error(
            `E-mail ${email} não existe. Defina CRM_OWNER_PASSWORD para criar o dono.`
        );
    }

    if (senha.length < 8) {
        throw new Error('CRM_OWNER_PASSWORD deve ter no mínimo 8 caracteres');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const dono = await prisma.usuario.create({
        data: {
            nome,
            email,
            senha: senhaHash,
            isCrmOwner: true
        },
        select: { id: true, email: true, isCrmOwner: true }
    });

    console.log(`CRM_OWNER criado: ${dono.email}`);
    console.log(
        `Login com contexto: POST /auth/login { email, senha, empresaId: "${empresa.id}" }`
    );
};

seed()
    .catch((erro) => {
        console.error(erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
