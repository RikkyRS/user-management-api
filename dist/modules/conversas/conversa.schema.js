import { z } from 'zod';
import { paginationQuerySchema } from '../../lib/pagination.js';
export const conversaMensagensQuerySchema = paginationQuerySchema;
export const enviarMensagemSchema = z.object({
    texto: z
        .string()
        .trim()
        .min(1, { message: 'Informe o texto' })
        .max(4096, { message: 'Texto muito longo' })
});
//# sourceMappingURL=conversa.schema.js.map