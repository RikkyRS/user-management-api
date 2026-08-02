const router = require('express').Router();
const usuarios = require('../data/usuarios');

router.get('/', (req, res) => {
    res.json(usuarios);
});

router.post('/', (req, res) => {
    if (!req.body.nome) {
        return res.status(400).json({
            mensagem: 'O campo nome é obrigatório!'
        });
    }
    const novoUsuario = {nome: req.body.nome};
    usuarios.push(novoUsuario);
    res.json({mensagem: 'Usuário criado com sucesso!'});
});
module.exports = router;