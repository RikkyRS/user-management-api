import 'dotenv/config';

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-local';
}

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL é obrigatório para os testes');
}
