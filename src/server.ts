import 'dotenv/config';
import app from './app.js';

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET é obrigatório');
    process.exit(1);
}

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
