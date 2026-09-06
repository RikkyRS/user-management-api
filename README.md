# User Management API

API REST multiempresa para um CRM. Sem frontend. Autenticação JWT com **sessão viva**, autorização por hierarquia de roles **por tenant** e cadastro **somente por staff**.

O dono da plataforma (`CRM_OWNER`, flag `isCrmOwner`) nasce no seed/SQL. Cada empresa tem memberships `OWNER` / `ADMIN` / `USER`. Quem não trabalha na empresa não tem auto-cadastro.

Documentação de ameaças e findings: [`docs/security`](./docs/security).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22, TypeScript (ESM) |
| HTTP | Express 5 |
| Validação | Zod |
| Persistência | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT HS256 (`jose`), senha com bcrypt, check de membership a cada request |
| Deploy | Docker (Render): `prisma migrate deploy` + `node dist/server.js` |

---

## Multiempresa

```text
Empresa
  └── MembroEmpresa (usuarioId + empresaId + role OWNER|ADMIN|USER)

Usuario
  └── isCrmOwner (plataforma; no máximo 1)
```

JWT: `{ sub, role, empresaId? }`.  
`authenticate` revalida usuário + membership no banco (Finding 004).  
Queries de `/usuarios` filtram pelo `empresaId` do token (Finding 003).

### Login

| Situação | Resposta |
|---|---|
| Credencial ok + 1 membership | `200` + token |
| Credencial ok + N memberships sem `empresaId` | `409` + lista `{ id, nome, role }` |
| Body com `empresaId` válido | `200` + token daquele tenant |
| `CRM_OWNER` | `200`; `empresaId` opcional (obrigatório para operar `/usuarios`) |

---

## Roles

| Role | Onde | Quem |
|---|---|---|
| `CRM_OWNER` | `Usuario.isCrmOwner` | Dono da plataforma (1) |
| `OWNER` / `ADMIN` / `USER` | `MembroEmpresa.role` | Por empresa |

**Staff** = `CRM_OWNER` \| `OWNER` \| `ADMIN`.

### O que cada um pode (dentro do tenant do token)

| Ação | CRM_OWNER | OWNER | ADMIN | USER |
|---|---|---|---|---|
| Login | sim | sim | sim | sim |
| `POST /empresas` | sim | não | não | não |
| Criar usuário | sim (nasce `USER`) | sim | sim | não |
| Listar usuários do tenant | sim | sim | sim | não |
| Ver / editar o próprio perfil | sim* | sim | sim | sim |
| Ver / editar outro no tenant | sim | sim | sim | não |
| `PATCH .../role` → OWNER/ADMIN/USER | sim | não | não | não |
| `PATCH .../role` → USER ↔ ADMIN | sim | sim | não | não |
| Deletar OWNER | sim | não | não | não |
| Deletar ADMIN/USER | sim | sim | sim | não |

\* CRM_OWNER precisa de `empresaId` no token para rotas de usuários.

Ninguém altera a própria role. Delete remove membership; se for a última e não for CRM_OWNER, apaga a conta (token morre).

---

## Superfície HTTP

Público:

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | `{ "status": "ok" }` |
| `POST` | `/auth/login` | `{ email, senha, empresaId? }` |

Autenticado (`Authorization: Bearer`):

| Método | Rota | Quem | Descrição |
|---|---|---|---|
| `GET/POST` | `/empresas` | CRM_OWNER | Listar / criar tenant |
| `POST` | `/usuarios` | staff + empresa | Cria USER no tenant |
| `GET` | `/usuarios` | staff + empresa | Lista do tenant |
| `GET/PUT/PATCH` | `/usuarios/:id` | staff ou próprio | No tenant |
| `PATCH` | `/usuarios/:id/role` | ver tabela | Membership role |
| `DELETE` | `/usuarios/:id` | staff | Remove do tenant (+ conta se última) |

`POST /auth/register` **não existe** (Finding 001).

---

## Exemplos

### Login (CRM_OWNER com contexto)

```http
POST /auth/login
Content-Type: application/json

{ "email": "dono@empresa.com", "senha": "minimo8c", "empresaId": "<uuid-empresa>" }
```

### Criar empresa (plataforma)

```http
POST /empresas
Authorization: Bearer <token-crm-owner>
Content-Type: application/json

{ "nome": "Empresa B" }
```

### Criar usuário (staff do tenant)

```http
POST /usuarios
Authorization: Bearer <token>
Content-Type: application/json

{ "nome": "Ana", "email": "ana@empresa.com", "senha": "minimo8c" }
```

---

## Ambiente

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Postgres |
| `JWT_SECRET` | Obrigatório no boot |
| `PORT` | Default `3000` |
| `CRM_OWNER_EMAIL` / `PASSWORD` / `NOME` | Seed do dono da plataforma |
| `EMPRESA_DEMO_NOME` | Seed: nome da primeira empresa |

---

## Subir local

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

---

## Fora de escopo (hoje)

Frontend, CI, paginação, WhatsApp, agentes de IA, RAG, White Label, rate limit, refresh token.

---

## Licença

ISC.
