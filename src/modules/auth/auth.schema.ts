import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'Informe um e-mail válido' }),
    senha: z.string().min(1, { message: 'Informe a senha' }),
    /** Obrigatório se o usuário tiver mais de uma empresa (ou CRM_OWNER quer contexto). */
    empresaId: z.string().uuid().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
