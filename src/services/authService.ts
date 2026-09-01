import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { criarToken } from '../lib/jwt.js';
import type { LoginInput } from '../modules/auth/auth.schema.js';

const login = async (dados: LoginInput) => {
    const usuario = await prisma.usuario.findUnique({
        where: { email: dados.email }
    });

    if (!usuario) {
        throw new Error('Credenciais inválidas');
    }

    const senhaOk = await bcrypt.compare(dados.senha, usuario.senha);

    if (!senhaOk) {
        throw new Error('Credenciais inválidas');
    }

    const token = await criarToken({ id: usuario.id, role: usuario.role });

    return {
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt
        }
    };
};

export { login };
