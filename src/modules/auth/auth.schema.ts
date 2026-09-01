import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'Informe um e-mail válido' }),
    senha: z.string().min(1, { message: 'Informe a senha' })
});

export type LoginInput = z.infer<typeof loginSchema>;
