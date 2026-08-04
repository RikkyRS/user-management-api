const usuarios = require('../data/usuarios');

const buscarUsuarioPorEmail = async (email) => {
    return usuarios.find(usuario => usuario.email === email);
};

const salvarUsuario = async (usuario) => {
    usuarios.push(usuario);
    return usuario;
}
module.exports = {
    buscarUsuarioPorEmail,
    salvarUsuario
}