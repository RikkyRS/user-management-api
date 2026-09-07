import { z } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { MultiplasEmpresasError } from '../lib/errors.js';
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof z.ZodError) {
        const errors = err.issues.map((erro) => {
            return {
                field: erro.path.join('.') || 'body',
                message: erro.message
            };
        });
        return res.status(400).json({
            message: 'Dados inválidos',
            errors
        });
    }
    if (err instanceof MultiplasEmpresasError) {
        return res.status(409).json({
            message: 'Múltiplas empresas — informe empresaId no login',
            empresas: err.empresas
        });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const model = String(err.meta?.modelName ?? '');
            const target = err.meta?.target;
            const targetRaw = Array.isArray(target)
                ? target.join(',')
                : String(target ?? '');
            const adapterMsg = String(err.meta?.driverAdapterError?.cause?.originalMessage ?? '');
            const blob = `${model}|${targetRaw}|${adapterMsg}|${err.message}`.toLowerCase();
            if (blob.includes('telefone')) {
                return res.status(409).json({
                    message: 'Telefone já cadastrado neste tenant'
                });
            }
            if (blob.includes('lead_empresaid_email') ||
                (model === 'Lead' && blob.includes('email'))) {
                return res.status(409).json({
                    message: 'E-mail já cadastrado neste tenant'
                });
            }
            return res.status(409).json({
                message: 'E-mail já cadastrado'
            });
        }
    }
    if (err instanceof Error && err.message === 'Usuário não encontrado') {
        return res.status(404).json({
            message: 'Usuário não encontrado'
        });
    }
    if (err instanceof Error && err.message === 'Lead não encontrado') {
        return res.status(404).json({
            message: 'Lead não encontrado'
        });
    }
    if (err instanceof Error &&
        err.message === 'Responsável inválido para o tenant') {
        return res.status(400).json({
            message: 'Responsável inválido para o tenant'
        });
    }
    if (err instanceof Error && err.message === 'Empresa não encontrada') {
        return res.status(404).json({
            message: 'Empresa não encontrada'
        });
    }
    if (err instanceof Error &&
        err.message === 'Contexto de empresa obrigatório') {
        return res.status(400).json({
            message: 'Contexto de empresa obrigatório — faça login com empresaId'
        });
    }
    if (err instanceof Error &&
        (err.message === 'Não autorizado' ||
            err.message === 'Credenciais inválidas')) {
        return res.status(401).json({
            message: err.message
        });
    }
    if (err instanceof Error && err.message === 'Acesso negado') {
        return res.status(403).json({
            message: 'Acesso negado'
        });
    }
    console.error(err);
    return res.status(500).json({
        message: 'Problema no sistema'
    });
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map