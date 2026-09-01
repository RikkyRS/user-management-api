# User Management API

API REST de usuários para um CRM de **uma empresa**. Sem frontend. Autenticação JWT, autorização por hierarquia de roles e cadastro **somente por staff**.

O dono do produto (`CRM_OWNER`) nasce no banco (seed ou SQL), não por HTTP. Quem não trabalha na empresa não tem endpoint de auto-cadastro.

Documentação de ameaças e findings: [`docs/security`](./docs/security).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22, TypeScript (ESM) |
| HTTP | Express 5 |
| Validação | Zod |
| Persistência | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT HS256 (`jose`), senha com bcrypt |
| Deploy | Docker (Render): `prisma migrate deploy` + `node dist/server.js` |

---

## Roles

| Role | Quem | Quantos |
|---|---|---|
| `CRM_OWNER` | Dono do CRM (plataforma) | 1 — seed/SQL; índice único no banco |
| `OWNER` | Dono(s) da empresa | vários |
| `ADMIN` | Operação (RH, secretaria) | vários |
| `USER` | Funcionário comum | vários |

**Staff** = `CRM_OWNER` \| `OWNER` \| `ADMIN`.

### O que cada um pode

| Ação | CRM_OWNER | OWNER | ADMIN | USER |
|---|---|---|---|---|
| Login | sim | sim | sim | sim |
| Criar usuário (`POST /usuarios`) | sim (nasce `USER`) | sim | sim | não |
| Listar usuários | sim | sim | sim | não |
| Ver / editar **o próprio** perfil | sim | sim | sim | sim |
| Ver / editar perfil de **outra** pessoa | sim | sim | sim | não |
| `PATCH .../role` → `OWNER`, `ADMIN`, `USER` | sim | não | não | não |
| `PATCH .../role` → `USER` ↔ `ADMIN` | sim | sim | não | não |
| Criar outro `CRM_OWNER` pela API | não | não | não | não |
| Deletar `CRM_OWNER` | não | não | não | não |
| Deletar `OWNER` | sim | não | não | não |
| Deletar `ADMIN` / `USER` | sim | sim | sim | não |

Ninguém altera a própria role. `role` no body de criação é ignorado.

---

## Superfície HTTP

Público (sem token):

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Liveness. `{ "status": "ok" }` — não pinga o banco. |
| `POST` | `/auth/login` | E-mail + senha → JWT (8 h) + usuário sem senha. |

Autenticado (`Authorization: Bearer <token>`). Todas as rotas `/usuarios` exigem JWT válido.

| Método | Rota | Quem | Descrição |
|---|---|---|---|
| `POST` | `/usuarios` | staff | Cria usuário. Sempre `USER`. |
| `GET` | `/usuarios` | staff | Lista (id, nome, e-mail, role, datas). |
| `GET` | `/usuarios/:id` | staff ou o próprio | Detalhe. `:id` é UUID. |
| `PUT` | `/usuarios/:id` | staff ou o próprio | Substitui nome + e-mail; senha se vier. |
| `PATCH` | `/usuarios/:id` | staff ou o próprio | Parcial: pelo menos um de nome, e-mail, senha. |
| `PATCH` | `/usuarios/:id/role` | ver tabela de roles | Body `{ "role": "OWNER" \| "ADMIN" \| "USER" }`. |
| `DELETE` | `/usuarios/:id` | staff + regras de delete | Remove o registro. |

`POST /auth/register` **não existe** (Finding 001).

---

## Exemplos

### Login

```http
POST /auth/login
Content-Type: application/json

{ "email": "dono@empresa.com", "senha": "minimo8c" }
```

```json
{
  "token": "eyJ...",
  "usuario": {
    "id": "…",
    "nome": "…",
    "email": "dono@empresa.com",
    "role": "CRM_OWNER",
    "createdAt": "…",
    "updatedAt": "…"
  }
}
```

Credencial errada → `401` `{ "message": "Credenciais inválidas" }`.

### Criar usuário (staff)

```http
POST /usuarios
Authorization: Bearer <token>
Content-Type: application/json

{ "nome": "Ana", "email": "ana@empresa.com", "senha": "minimo8c" }
```

`201` — objeto público (sem senha), `role: "USER"`.

E-mail repetido → `409`. Body inválido → `400` com `errors[]`. Sem token → `401`. Token `USER` → `403`.

### Promover

```http
PATCH /usuarios/<uuid>/role
Authorization: Bearer <token-crm-owner>
Content-Type: application/json

{ "role": "OWNER" }
```

---

## Erros

| Status | Quando |
|---|---|
| 400 | Zod (validação) |
| 401 | Sem Bearer, JWT inválido/expirado, login falhou |
| 403 | Role insuficiente / hierarquia / alvo intocável |
| 404 | Usuário inexistente (rotas autenticadas) |
| 409 | E-mail único |
| 500 | Falha interna; corpo genérico (`Problema no sistema`) |

Respostas de usuário **nunca** incluem `senha`.

---

## Ambiente

Copia [`.env.example`](./.env.example):

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Postgres (Prisma + adapter `pg`) |
| `JWT_SECRET` | Obrigatório no boot; processo sai se faltar |
| `PORT` | Default `3000` |
| `CRM_OWNER_EMAIL` | Seed: promove ou cria o dono |
| `CRM_OWNER_PASSWORD` | Seed: só se o e-mail ainda não existir (mín. 8) |
| `CRM_OWNER_NOME` | Seed: default `Dono do CRM` |

Não commitar `.env`.

---

## Subir local

Precisa de Postgres (`docker compose up` sobe só o banco).

```bash
cp .env.example .env
# preenche DATABASE_URL e JWT_SECRET

npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed          # opcional: CRM_OWNER
npm run dev                 # tsx watch → src/server.ts
```

Build de produção local:

```bash
npx prisma generate
npm run build
npm start                   # node dist/server.js
```

O client Prisma é gerado em `src/generated/prisma` (gitignored). Sem `prisma generate` o TypeScript não compila.

---

## Docker

```text
npm ci → prisma generate → tsc
npm ci --omit=dev
prisma migrate deploy && node dist/server.js
```

`dist/` não entra na image (`.dockerignore`). No Render, `DATABASE_URL` e `JWT_SECRET` vão no painel, não no compose da sua máquina.

Depois do primeiro deploy desta hierarquia: migrate sobe o enum; se você já tinha usuário, promova:

```sql
UPDATE "Usuario" SET role = 'CRM_OWNER' WHERE email = 'seu@email.com';
```

Faça login de novo — JWT antigo carrega a role velha por até 8 h.

---

## Fora de escopo (hoje)

Frontend, CI, paginação, várias empresas (tabela `Empresa`), rate limit, refresh token, e-mail transacional.

---

## Licença

ISC. Ver [`package.json`](./package.json).
