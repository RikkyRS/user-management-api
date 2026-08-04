const usuarioRepository = require('../repositories/usuarioRepository');

const criarUsuario = async ({ nome, email, senha }) => {
        if (!nome || !email || !senha) {
        throw new Error('Todos os campos são obrigatórios.');
    }
    const usuarioExistente = await usuarioRepository.buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
        throw new Error('Este email já está cadastrado.')
    }
    const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        senha
    };
    return await usuarioRepository.salvarUsuario(novoUsuario);
};
module.exports = {
    criarUsuario
};