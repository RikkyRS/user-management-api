import prisma from '../lib/prisma.js';
import { exigirEmpresaId } from '../lib/acesso.js';
import type { EffectiveRole } from '../lib/roles.js';
import type { WhatsappConfigUpsertInput } from '../modules/whatsapp/whatsapp.schema.js';

type Ator = {
    id: string;
    role: EffectiveRole;
    empresaId?: string;
    isCrmOwner: boolean;
};

const configSelect = {
    id: true,
    empresaId: true,
    phoneNumberId: true,
    displayPhone: true,
    verifyToken: true,
    createdAt: true,
    updatedAt: true
} as const;

const upsertConfig = async (ator: Ator, dados: WhatsappConfigUpsertInput) => {
    const empresaId = exigirEmpresaId(ator);

    return prisma.whatsappConfig.upsert({
        where: { empresaId },
        create: {
            empresaId,
            phoneNumberId: dados.phoneNumberId,
            accessToken: dados.accessToken,
            appSecret: dados.appSecret,
            verifyToken: dados.verifyToken,
            displayPhone: dados.displayPhone
        },
        update: {
            phoneNumberId: dados.phoneNumberId,
            accessToken: dados.accessToken,
            appSecret: dados.appSecret,
            verifyToken: dados.verifyToken,
            ...(dados.displayPhone !== undefined
                ? { displayPhone: dados.displayPhone }
                : {})
        },
        select: configSelect
    });
};

export { upsertConfig };
