import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
const usuarioPublicoSelect = {
    id: true,
    nome: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true
};
const garantirUsuarioExiste = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: { id: true }
    });
    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }
};
const criarUsuario = async (dados) => {
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const usuario = await prisma.usuario.create({
        data: {
            nome: dados.nome,
            email: dados.email,
            senha: senhaHash
        },
        select: usuarioPublicoSelect
    });
    return usuario;
};
const listarUsuarios = async () => {
    const usuarios = await prisma.usuario.findMany({
        select: usuarioPublicoSelect
    });
    return usuarios;
};
const buscarUsuario = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: usuarioPublicoSelect
    });
    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }
    return usuario;
};
/** PUT — substituição completa do perfil editável (nome + email; senha se vier) */
const substituirUsuario = async (id, dados) => {
    await garantirUsuarioExiste(id);
    const data = {
        nome: dados.nome,
        email: dados.email
    };
    if (dados.senha !== undefined) {
        data.senha = await bcrypt.hash(dados.senha, 10);
    }
    const usuario = await prisma.usuario.update({
        where: { id },
        data,
        select: usuarioPublicoSelect
    });
    return usuario;
};
/** PATCH — atualização parcial (só os campos enviados) */
const atualizarUsuarioParcial = async (id, dados) => {
    await garantirUsuarioExiste(id);
    const data = {};
    if (dados.nome !== undefined) {
        data.nome = dados.nome;
    }
    if (dados.email !== undefined) {
        data.email = dados.email;
    }
    if (dados.senha !== undefined) {
        data.senha = await bcrypt.hash(dados.senha, 10);
    }
    const usuario = await prisma.usuario.update({
        where: { id },
        data,
        select: usuarioPublicoSelect
    });
    return usuario;
};
const deletarUsuario = async (id) => {
    await garantirUsuarioExiste(id);
    await prisma.usuario.delete({
        where: { id }
    });
    return {
        mensagem: 'Usuário deletado com sucesso'
    };
};
export { criarUsuario, listarUsuarios, buscarUsuario, substituirUsuario, atualizarUsuarioParcial, deletarUsuario };
//# sourceMappingURL=usuarioService.js.map