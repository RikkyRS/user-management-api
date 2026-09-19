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

const seedWhatsappConfig = async (empresaId: string) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
    const displayPhone = process.env.WHATSAPP_DISPLAY_PHONE?.trim();

    if (!phoneNumberId || !accessToken || !appSecret || !verifyToken) {
        return;
    }

    await prisma.whatsappConfig.upsert({
        where: { empresaId },
        create: {
            empresaId,
            phoneNumberId,
            accessToken,
            appSecret,
            verifyToken,
            displayPhone: displayPhone || undefined
        },
        update: {
            phoneNumberId,
            accessToken,
            appSecret,
            verifyToken,
            ...(displayPhone ? { displayPhone } : {})
        }
    });

    console.log(`WhatsappConfig upsert na empresa ${empresaId}`);
};

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

    await seedWhatsappConfig(empresa.id);

    const email = process.env.CRM_OWNER_EMAIL?.trim();
    const senha = process.env.CRM_OWNER_PASSWORD;
    const nome = process.env.CRM_OWNER_NOME?.trim() || 'Dono do CRM';

    if (!email) {
        console.log(
            'Nenhum CRM_OWNER. Defina CRM_OWNER_EMAIL (+ PASSWORD) e rode o seed.'
        );
        return;
    }

    if (!senha || senha.length < 8) {
        throw new Error('CRM_OWNER_PASSWORD é obrigatório e deve ter no mínimo 8 caracteres');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const donoAtual = await prisma.usuario.findFirst({
        where: { isCrmOwner: true }
    });
    const porEmail = await prisma.usuario.findUnique({
        where: { email }
    });

    if (donoAtual && porEmail && donoAtual.id !== porEmail.id) {
        throw new Error(
            `CRM_OWNER é ${donoAtual.email}, mas ${email} já existe como outro usuário`
        );
    }

    const donoId = donoAtual?.id ?? porEmail?.id;
    const dono = donoId
        ? await prisma.usuario.update({
              where: { id: donoId },
              data: {
                  nome,
                  email,
                  senha: senhaHash,
                  isCrmOwner: true,
                  tokenVersion: { increment: 1 }
              },
              select: { id: true, email: true }
          })
        : await prisma.usuario.create({
              data: {
                  nome,
                  email,
                  senha: senhaHash,
                  isCrmOwner: true
              },
              select: { id: true, email: true }
          });

    await prisma.membroEmpresa.upsert({
        where: {
            usuarioId_empresaId: {
                usuarioId: dono.id,
                empresaId: empresa.id
            }
        },
        create: {
            usuarioId: dono.id,
            empresaId: empresa.id,
            role: 'OWNER'
        },
        update: { role: 'OWNER' }
    });

    console.log(`CRM_OWNER: ${dono.email} (plataforma + OWNER na empresa ${empresa.nome})`);
    console.log(
        `Login: POST /auth/login { email, senha, empresaId: "${empresa.id}" }`
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
