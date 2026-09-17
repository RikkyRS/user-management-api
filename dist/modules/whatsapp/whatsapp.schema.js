import { z } from 'zod';
export const whatsappConfigUpsertSchema = z.object({
    phoneNumberId: z.string().min(1, { message: 'Informe phoneNumberId' }),
    accessToken: z.string().min(1, { message: 'Informe accessToken' }),
    appSecret: z.string().min(1, { message: 'Informe appSecret' }),
    verifyToken: z.string().min(1, { message: 'Informe verifyToken' }),
    displayPhone: z.string().min(1).optional()
});
//# sourceMappingURL=whatsapp.schema.js.map