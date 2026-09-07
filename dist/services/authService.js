import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { criarToken } from '../lib/jwt.js';
import { MultiplasEmpresasError } from '../lib/errors.js';
/** Hash bcrypt cost 10 — equaliza timing quando o e-mail não existe (Finding 009). */
let dummyHash = null;
const getDummyHash = async () => {
    if (!dummyHash) {
        dummyHash = await bcrypt.hash('__timing_dummy__', 10);
    }
    return dummyHash;
};
const usuarioPublico = (usuario, role, empresaId) => ({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role,
    empresaId: empresaId ?? null,
    isCrmOwner: usuario.isCrmOwner,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt
});
const login = async (dados) => {
    const usuario = await prisma.usuario.findUnique({
        where: { email: dados.email }
    });
    const hashParaCompare = usuario?.senha ?? (await getDummyHash());
    const senhaOk = await bcrypt.compare(dados.senha, hashParaCompare);
    if (!usuario || !senhaOk) {
        throw new Error('Credenciais inválidas');
    }
    if (usuario.isCrmOwner) {
        if (dados.empresaId) {
            const empresa = await prisma.empresa.findUnique({
                where: { id: dados.empresaId },
                select: { id: true }
            });
            if (!empresa) {
                throw new Error('Empresa não encontrada');
            }
        }
        const role = 'CRM_OWNER';
        const token = await criarToken({
            id: usuario.id,
            role,
            empresaId: dados.empresaId,
            tokenVersion: usuario.tokenVersion
        });
        return {
            token,
            usuario: usuarioPublico(usuario, role, dados.empresaId)
        };
    }
    const membros = await prisma.membroEmpresa.findMany({
        where: { usuarioId: usuario.id },
        select: {
            role: true,
            empresaId: true,
            empresa: { select: { id: true, nome: true } }
        }
    });
    if (membros.length === 0) {
        throw new Error('Credenciais inválidas');
    }
    if (dados.empresaId) {
        const membro = membros.find((m) => m.empresaId === dados.empresaId);
        if (!membro) {
            throw new Error('Acesso negado');
        }
        const role = membro.role;
        const token = await criarToken({
            id: usuario.id,
            role,
            empresaId: membro.empresaId,
            tokenVersion: usuario.tokenVersion
        });
        return {
            token,
            usuario: usuarioPublico(usuario, role, membro.empresaId)
        };
    }
    if (membros.length > 1) {
        throw new MultiplasEmpresasError(membros.map((m) => ({
            id: m.empresa.id,
            nome: m.empresa.nome,
            role: m.role
        })));
    }
    const unico = membros[0];
    const role = unico.role;
    const token = await criarToken({
        id: usuario.id,
        role,
        empresaId: unico.empresaId,
        tokenVersion: usuario.tokenVersion
    });
    return {
        token,
        usuario: usuarioPublico(usuario, role, unico.empresaId)
    };
};
export { login };
//# sourceMappingURL=authService.js.map