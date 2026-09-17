import prisma from '../lib/prisma.js';
import { exigirEmpresaId } from '../lib/acesso.js';
const configSelect = {
    id: true,
    empresaId: true,
    phoneNumberId: true,
    displayPhone: true,
    verifyToken: true,
    createdAt: true,
    updatedAt: true
};
const upsertConfig = async (ator, dados) => {
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
//# sourceMappingURL=whatsappConfigService.js.map