# User Management API

API REST multiempresa para um CRM. Sem frontend. Autenticação JWT com **sessão viva**, autorização por hierarquia de roles **por tenant**, cadastro de funcionários **somente por staff**, e **Lead** como dado comercial (sem login).

O dono da plataforma (`CRM_OWNER`, flag `isCrmOwner`) nasce no seed/SQL. Cada empresa tem memberships `OWNER` / `ADMIN` / `USER` e seus próprios leads. Quem não trabalha na empresa não tem auto-cadastro. Cliente/lead **não** é `Usuario`.

Documentação de ameaças e findings: [`docs/security`](./docs/security).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22, TypeScript (ESM) |
| HTTP | Express 5 |
| Validação | Zod |
| Persistência | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT HS256 (`jose`), bcrypt, sessão viva + `tokenVersion`, rate limit no login |
| Deploy | Docker non-root (`USER node`) + HEALTHCHECK; Render: migrate + `node dist/server.js` |

---

## Multiempresa

```text
Empresa
  ├── MembroEmpresa (usuarioId + empresaId + role OWNER|ADMIN|USER)
  └── Lead (dados comerciais; sem login)

Usuario
  └── isCrmOwner (plataforma; no máximo 1)
```

JWT: `{ sub, role, empresaId?, tokenVersion }`.  
`authenticate` revalida usuário + membership + `tokenVersion` no banco (Findings 004 / 007).  
Queries de `/usuarios` e `/leads` filtram pelo `empresaId` do token (Findings 003 / 005).  
Login: rate limit 100/15min/IP (008), timing com bcrypt dummy (009).

### Login

| Situação | Resposta |
|---|---|
| Credencial ok + 1 membership | `200` + token |
| Credencial ok + N memberships sem `empresaId` | `409` + lista `{ id, nome, role }` |
| Body com `empresaId` válido | `200` + token daquele tenant |
| `CRM_OWNER` | `200`; `empresaId` opcional (obrigatório para `/usuarios` e `/leads`) |

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
| Ver / editar o próprio perfil | sim† | sim | sim | sim |
| Ver / editar outro no tenant | sim | sim | sim | não |
| `PATCH .../role` → OWNER/ADMIN/USER | sim | não | não | não |
| `PATCH .../role` → USER ↔ ADMIN | sim | sim | não | não |
| Deletar OWNER | sim | não | não | não |
| Deletar ADMIN/USER | sim | sim | sim | não |
| Criar Lead | sim | sim | sim | não* |
| Listar / editar todos os Leads do tenant | sim | sim | sim | não* |
| Ver / editar Lead em que é responsável | sim | sim | sim | sim |
| Deletar Lead | sim | sim | sim | não |

\* USER não cria Lead; staff cria e pode atribuir `responsavelUsuarioId`.  
† CRM_OWNER precisa de `empresaId` no token para rotas de usuários e leads.

Ninguém altera a própria role. Delete de usuário remove membership; se for a última e não for CRM_OWNER, apaga a conta (token morre).

---

## Lead

Registro comercial da empresa. **Sem senha, sem JWT, sem acesso ao sistema.**

| Campo | Obrigatório | Notas |
|---|---|---|
| `nome` | sim | |
| `telefone` | sim | único por `empresaId` → 409 se repetir |
| `email` | não | se informado, único por `empresaId` → 409 |
| `origem` | não | ex.: `whatsapp` |
| `interesse` | não | |
| `status` | default `NOVO` | funil abaixo |
| `responsavelUsuarioId` | não | membro do tenant (vendedor) |

Funil (`status`):

```text
NOVO → EM_ATENDIMENTO → QUALIFICADO → PROPOSTA → NEGOCIACAO → CLIENTE
                                                              ↘ PERDIDO
```

Regras de acesso:
- Staff: cria, lista todos, edita todos, deleta.
- USER: só lê/edita leads em que `responsavelUsuarioId ===` o próprio id; não deleta.
- Fora do tenant → `404` (Finding 005).

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
| `GET` | `/auth/me` | autenticado | Perfil do ator do token |
| `GET/POST` | `/empresas` | CRM_OWNER | Listar / criar tenant |
| `PATCH` | `/empresas/:id` | CRM_OWNER | Renomear empresa |
| `POST` | `/usuarios` | staff + empresa | Cria USER no tenant |
| `GET` | `/usuarios` | staff + empresa | Lista paginada `{ data, page, limit, total }` (`?page&limit`) |
| `GET/PUT/PATCH` | `/usuarios/:id` | staff ou próprio | No tenant |
| `PATCH` | `/usuarios/:id/role` | ver tabela | Membership role |
| `DELETE` | `/usuarios/:id` | staff | Remove do tenant (+ conta se última) |
| `POST` | `/leads` | staff + empresa | Cria lead |
| `GET` | `/leads` | autenticado + empresa | Paginado + `?status&q`; staff: todos; USER: só os seus |
| `GET/PUT/PATCH` | `/leads/:id` | autenticado + escopo | Staff ou responsável |
| `DELETE` | `/leads/:id` | staff | Remove lead |

Paginação: `page` (default 1), `limit` (default 20, max 100).

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

### Criar lead (staff)

```http
POST /leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Maria",
  "telefone": "+5511999990000",
  "email": "maria@cliente.com",
  "origem": "whatsapp",
  "interesse": "plano pro",
  "status": "NOVO",
  "responsavelUsuarioId": "<uuid-vendedor>"
}
```

`201` — objeto do lead. Telefone ou e-mail repetido no mesmo tenant → `409`.

### Atualizar status do funil

```http
PATCH /leads/<uuid>
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "EM_ATENDIMENTO" }
```

---

## Ambiente

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Postgres |
| `JWT_SECRET` | Obrigatório no boot |
| `PORT` | Default `3000` |
| `CORS_ORIGIN` | Origem do front (ex. `http://localhost:5173`); vazio = CORS off |
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

Frontend, CI, WhatsApp webhook, agentes de IA, RAG, White Label, refresh token, OpenAPI.

---

## Licença

ISC.
