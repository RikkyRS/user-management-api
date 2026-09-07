import { z } from 'zod';
import { empresaCreateSchema, empresaPatchSchema } from '../modules/empresas/empresa.schema.js';
import { criarEmpresa as criarEmpresaService, listarEmpresas as listarEmpresasService, atualizarEmpresa as atualizarEmpresaService } from '../services/empresaService.js';
const criarEmpresa = async (req, res, next) => {
    try {
        const dados = empresaCreateSchema.parse(req.body);
        const empresa = await criarEmpresaService(dados);
        res.status(201).json(empresa);
    }
    catch (error) {
        next(error);
    }
};
const listarEmpresas = async (_req, res, next) => {
    try {
        const empresas = await listarEmpresasService();
        res.json(empresas);
    }
    catch (error) {
        next(error);
    }
};
const atualizarEmpresa = async (req, res, next) => {
    try {
        const id = z.string().uuid().parse(req.params.id);
        const dados = empresaPatchSchema.parse(req.body);
        const empresa = await atualizarEmpresaService(id, dados);
        res.json(empresa);
    }
    catch (error) {
        next(error);
    }
};
export { criarEmpresa, listarEmpresas, atualizarEmpresa };
//# sourceMappingURL=empresaController.js.map