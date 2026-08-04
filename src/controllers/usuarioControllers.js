    const usuarioService = require('../services/usuarioService');
    const criarUsuario = async (req, res) => {
        const { nome, email, senha } = req.body;
        const usuarioCriado = await usuarioService.criarUsuario({nome, email, senha});
        return res.status(201).json({
            mensagem: 'Usuário criado com sucesso!',
            usuario: {
                id: usuarioCriado.id,
                nome: usuarioCriado.nome,
                email: usuarioCriado.email
            }
        });
        };
        module.exports = {
            criarUsuario
        };