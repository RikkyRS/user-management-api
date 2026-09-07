import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { SESSION_COOKIE } from '../src/lib/sessionCookie.js';

const email = process.env.CRM_OWNER_EMAIL ?? 'ci-owner@example.com';
const senha = process.env.CRM_OWNER_PASSWORD ?? 'minimo8chars';

function cookieFrom(res: request.Response): string {
    const raw = res.headers['set-cookie'];
    if (!raw) return '';
    const list = Array.isArray(raw) ? raw : [raw];
    const session = list.find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    return session?.split(';')[0] ?? '';
}

describe('API smoke', () => {
    let token = '';
    let empresaId = '';
    let sessionCookie = '';

    beforeAll(async () => {
        const login = await request(app).post('/auth/login').send({
            email,
            senha
        });

        expect(login.status).toBe(200);
        expect(login.body.token).toBeTruthy();
        expect(cookieFrom(login)).toContain(`${SESSION_COOKIE}=`);
        token = login.body.token as string;
        sessionCookie = cookieFrom(login);

        // CRM_OWNER sem empresaId no login: busca lista e faz login com contexto
        const empresas = await request(app)
            .get('/empresas')
            .set('Authorization', `Bearer ${token}`);

        if (empresas.status === 200 && Array.isArray(empresas.body) && empresas.body[0]) {
            empresaId = empresas.body[0].id as string;
            const comEmpresa = await request(app).post('/auth/login').send({
                email,
                senha,
                empresaId
            });
            expect(comEmpresa.status).toBe(200);
            token = comEmpresa.body.token as string;
            sessionCookie = cookieFrom(comEmpresa);
        } else {
            // já veio com empresa no token
            empresaId = (login.body.usuario?.empresaId as string) ?? '';
        }

        expect(empresaId).toBeTruthy();
        expect(sessionCookie).toBeTruthy();
    });

    it('GET /health → 200', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });

    it('GET /auth/me → perfil CRM_OWNER (Bearer)', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.email).toBe(email);
        expect(res.body.role).toBe('CRM_OWNER');
        expect(res.body.isCrmOwner).toBe(true);
    });

    it('GET /auth/me → perfil via cookie HttpOnly', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Cookie', sessionCookie);
        expect(res.status).toBe(200);
        expect(res.body.email).toBe(email);
        expect(res.body.isCrmOwner).toBe(true);
    });

    it('GET /auth/me sem token → 401', async () => {
        const res = await request(app).get('/auth/me');
        expect(res.status).toBe(401);
    });

    it('login inválido → 401', async () => {
        const res = await request(app).post('/auth/login').send({
            email,
            senha: 'senha-errada-xx'
        });
        expect(res.status).toBe(401);
    });

    it('POST /auth/logout limpa cookie', async () => {
        const res = await request(app).post('/auth/logout');
        expect(res.status).toBe(204);
        const cleared = cookieFrom(res);
        expect(cleared).toContain(`${SESSION_COOKIE}=`);
        expect(cleared === `${SESSION_COOKIE}=` || cleared.startsWith(`${SESSION_COOKIE}=;`)).toBe(
            true
        );
    });

    it('GET /usuarios paginado', async () => {
        const res = await request(app)
            .get('/usuarios')
            .query({ page: 1, limit: 5 })
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            page: 1,
            limit: 5
        });
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(typeof res.body.total).toBe('number');
    });

    it('GET /leads paginado', async () => {
        const res = await request(app)
            .get('/leads')
            .query({ page: 1, limit: 5 })
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            page: 1,
            limit: 5
        });
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(typeof res.body.total).toBe('number');
    });

    it('PATCH /empresas/:id renomeia (CRM_OWNER)', async () => {
        const nome = 'Empresa Demo CI';
        const res = await request(app)
            .patch(`/empresas/${empresaId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nome });
        expect(res.status).toBe(200);
        expect(res.body.nome).toBe(nome);

        // restaura nome estável
        await request(app)
            .patch(`/empresas/${empresaId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nome: process.env.EMPRESA_DEMO_NOME ?? 'Empresa Demo' });
    });

    it('USER não lista /usuarios (403)', async () => {
        const userEmail = `user.smoke.${Date.now()}@test.local`;
        const userSenha = 'minimo8chars';

        const created = await request(app)
            .post('/usuarios')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Smoke User',
                email: userEmail,
                senha: userSenha
            });
        expect(created.status).toBe(201);

        const userLogin = await request(app).post('/auth/login').send({
            email: userEmail,
            senha: userSenha,
            empresaId
        });
        expect(userLogin.status).toBe(200);

        const list = await request(app)
            .get('/usuarios')
            .set('Authorization', `Bearer ${userLogin.body.token}`);
        expect(list.status).toBe(403);
    });
});
