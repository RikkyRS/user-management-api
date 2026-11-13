import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Local/Render: DATABASE_URL.
 * Vercel + integração Supabase: POSTGRES_URL (pooler em modo transação, ideal para serverless).
 */
const urlBruta = process.env['DATABASE_URL'] ?? process.env['POSTGRES_URL'];

/**
 * O driver `pg` trata `sslmode=require` como "verificar o certificado", e o
 * certificado do pooler do Supabase não passa nessa verificação. Com
 * `uselibpqcompat=true` o `pg` segue a regra do libpq: `require` = conexão
 * criptografada, sem validar a cadeia.
 */
const ajustarSsl = (url: string | undefined) => {
    if (!url) return url;
    try {
        const u = new URL(url);
        if (u.searchParams.get('sslmode') === 'require' && !u.searchParams.has('uselibpqcompat')) {
            u.searchParams.set('uselibpqcompat', 'true');
        }
        return u.toString();
    } catch {
        return url;
    }
};

const adapter = new PrismaPg({ connectionString: ajustarSsl(urlBruta) });

const prisma = new PrismaClient({ adapter });

export default prisma;
