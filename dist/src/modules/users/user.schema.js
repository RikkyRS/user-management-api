import { z } from 'zod';
const senhaSchema = z
    .string()
    .min(8, { message: 'Informe uma senha válida' });
/** Schema de criação (POST) — todos os campos obrigatórios */
export const usuarioSchema = z.object({
    nome: z.string().min(1, { message: 'Informe o nome' }),
    email: z.string().email({ message: 'Informe um e-mail válido' }),
    senha: senhaSchema
});
/**
 * PUT — substituição do perfil editável.
 * nome e email obrigatórios; senha opcional (só troca se vier).
 */
export const usuarioPutSchema = z.object({
    nome: z.string().min(1, { message: 'Informe o nome' }),
    email: z.string().email({ message: 'Informe um e-mail válido' }),
    senha: senhaSchema.optional()
});
/**
 * PATCH — atualização parcial.
 * Qualquer subset de nome/email/senha; pelo menos 1 campo.
 */
export const usuarioPatchSchema = z
    .object({
    nome: z.string().min(1, { message: 'Informe o nome' }).optional(),
    email: z.string().email({ message: 'Informe um e-mail válido' }).optional(),
    senha: senhaSchema.optional()
})
    .refine((data) => data.nome !== undefined ||
    data.email !== undefined ||
    data.senha !== undefined, { message: 'Informe ao menos um campo para atualizar' });
export default usuarioSchema;
//# sourceMappingURL=user.schema.js.map