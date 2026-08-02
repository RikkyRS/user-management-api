const express = require('express');
const app = express();
const usuarioRouter = require('./routes/usuarioRoutes');

app.use('/usuarios', usuarioRouter);

app.listen(3000, () => {
    console.log('Server funcionando porta 3000');
});