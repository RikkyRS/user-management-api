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
    const existente = await prisma.usuario.findFirst({
        where: { role: 'CRM_OWNER' }
    });

    if (existente) {
        console.log(`CRM_OWNER já existe: ${existente.email}`);
        return;
    }

    const email = process.env.CRM_OWNER_EMAIL;
    const senha = process.env.CRM_OWNER_PASSWORD;
    const nome = process.env.CRM_OWNER_NOME ?? 'Dono do CRM';

    if (!email) {
        console.log(
            'Nenhum CRM_OWNER no banco. Defina CRM_OWNER_EMAIL (e CRM_OWNER_PASSWORD se for criar) e rode o seed, ou faça UPDATE no SQL.'
        );
        return;
    }

    const porEmail = await prisma.usuario.findUnique({
        where: { email }
    });

    if (porEmail) {
        await prisma.usuario.update({
            where: { id: porEmail.id },
            data: { role: 'CRM_OWNER' }
        });
        console.log(`Usuário existente promovido a CRM_OWNER: ${email}`);
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
            role: 'CRM_OWNER'
        },
        select: { id: true, email: true, role: true }
    });

    console.log(`CRM_OWNER criado: ${dono.email}`);
};

seed()
    .catch((erro) => {
        console.error(erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
