import { z } from 'zod';

export const leadStatusSchema = z.enum([
    'NOVO',
    'EM_ATENDIMENTO',
    'QUALIFICADO',
    'PROPOSTA',
    'NEGOCIACAO',
    'CLIENTE',
    'PERDIDO'
]);

const telefoneSchema = z
    .string()
    .min(8, { message: 'Informe um telefone válido' })
    .max(32, { message: 'Telefone muito longo' });

export const leadCreateSchema = z.object({
    nome: z.string().min(1, { message: 'Informe o nome' }),
    telefone: telefoneSchema,
    email: z.string().email({ message: 'Informe um e-mail válido' }).optional(),
    origem: z.string().min(1).optional(),
    interesse: z.string().min(1).optional(),
    status: leadStatusSchema.optional(),
    responsavelUsuarioId: z.string().uuid().optional()
});

export const leadPutSchema = z.object({
    nome: z.string().min(1, { message: 'Informe o nome' }),
    telefone: telefoneSchema,
    email: z
        .string()
        .email({ message: 'Informe um e-mail válido' })
        .nullable()
        .optional(),
    origem: z.string().min(1).nullable().optional(),
    interesse: z.string().min(1).nullable().optional(),
    status: leadStatusSchema,
    responsavelUsuarioId: z.string().uuid().nullable().optional()
});

export const leadPatchSchema = z
    .object({
        nome: z.string().min(1, { message: 'Informe o nome' }).optional(),
        telefone: telefoneSchema.optional(),
        email: z
            .string()
            .email({ message: 'Informe um e-mail válido' })
            .nullable()
            .optional(),
        origem: z.string().min(1).nullable().optional(),
        interesse: z.string().min(1).nullable().optional(),
        status: leadStatusSchema.optional(),
        responsavelUsuarioId: z.string().uuid().nullable().optional()
    })
    .refine(
        (data) =>
            data.nome !== undefined ||
            data.telefone !== undefined ||
            data.email !== undefined ||
            data.origem !== undefined ||
            data.interesse !== undefined ||
            data.status !== undefined ||
            data.responsavelUsuarioId !== undefined,
        { message: 'Informe ao menos um campo para atualizar' }
    );

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadPutInput = z.infer<typeof leadPutSchema>;
export type LeadPatchInput = z.infer<typeof leadPatchSchema>;
