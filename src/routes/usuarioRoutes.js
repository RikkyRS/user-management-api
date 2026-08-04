const router = require('express').Router();
const usuarios = require('../data/usuarios');
const usuarioController = require('../controllers/usuarioControllers');

router.get('/', usuarioController.listarUsuarios);
router.post('/', usuarioController.criarUsuario);

module.exports = router;