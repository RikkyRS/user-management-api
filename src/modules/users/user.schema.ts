import { z } from 'zod';

const senhaSchema = z
    .string()
    .min(8, { message: 'Informe uma senha válida' });

export const roleSchema = z.enum(['CRM_OWNER', 'OWNER', 'ADMIN', 'USER']);

export const roleAtribuivelSchema = z.enum(['OWNER', 'ADMIN', 'USER']);

/** Schema de criação (POST) — sempre nasce USER; role não vem no body */
export const usuarioSchema = z.object({
    nome: z.string().min(1, { message: 'Informe o nome' }),
    email: z.string().email({ message: 'Informe um e-mail válido' }),
    senha: senhaSchema
});

/** POST /usuarios (staff) — mesmo contrato do registro; promoção é outro endpoint */
export const usuarioAdminCreateSchema = usuarioSchema;

export const usuarioRolePatchSchema = z.object({
    role: roleAtribuivelSchema
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
    .refine(
        (data) =>
            data.nome !== undefined ||
            data.email !== undefined ||
            data.senha !== undefined,
        { message: 'Informe ao menos um campo para atualizar' }
    );

export type UsuarioCreateInput = z.infer<typeof usuarioSchema>;
export type UsuarioAdminCreateInput = z.infer<typeof usuarioAdminCreateSchema>;
export type UsuarioPutInput = z.infer<typeof usuarioPutSchema>;
export type UsuarioPatchInput = z.infer<typeof usuarioPatchSchema>;
export type UsuarioRolePatchInput = z.infer<typeof usuarioRolePatchSchema>;

export default usuarioSchema;
