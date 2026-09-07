import { z } from 'zod';
export const empresaCreateSchema = z.object({
    nome: z.string().min(1, { message: 'Informe o nome da empresa' })
});
//# sourceMappingURL=empresa.schema.js.map