# Secure API — trilho de AppSec

Este repositório é a API de um CRM (Express + TypeScript + Prisma + JWT).
O diferencial não é só “ter auth”: é provar, finding a finding, o ciclo:

```text
Threat Model
     ↓
Possíveis ameaças
     ↓
Riscos
     ↓
Mitigações
     ↓
Implementação
     ↓
Finding (evidência)
```

Cada peça (cadastro, role, login, health, secrets, tenant, lead) entra por aqui **antes** de virar feature nova.

## Superfície atual

| Superfície | Quem acessa | Ameaça típica |
|---|---|---|
| `POST /auth/login` | público | brute force, enumeração, JWT zumbi |
| `GET /health` | público | info disclosure (hoje não vaza dado) |
| `GET /auth/me` | autenticado | vazamento de perfil se token fraco |
| Browser (CORS) | front SPA | origem indevida |
| `POST /empresas` | CRM_OWNER | criação indevida de tenant |
| `POST /usuarios` | staff + contexto empresa | criação cross-tenant |
| `PATCH /usuarios/:id/role` | CRM_OWNER / OWNER | privilege escalation |
| `GET/PUT/PATCH/DELETE /usuarios...` | autenticado + tenant | IDOR cross-tenant |
| `GET/POST/PATCH/DELETE /leads...` | autenticado + tenant | IDOR lead / pipeline |
| Banco / `.env` | deploy | secret leak, CRM_OWNER clonado |

Roles: `CRM_OWNER` (plataforma) → membership `OWNER` → `ADMIN` → `USER` **por empresa**.  
Lead = dado comercial (sem login).

## Findings

| ID | Área | Status |
|---|---|---|
| [001](./findings/001-cadastro-publico.md) | Autorização — cadastro público | Corrigido |
| [002](./findings/002-autenticacao-jwt.md) | Autenticação — JWT (placeholder protegido) | Vazio — ver [006](./findings/006-contrato-jwt.md) |
| [003](./findings/003-isolamento-tenant.md) | Autorização — IDOR multi-tenant | Corrigido |
| [004](./findings/004-jwt-zumbi-pos-delete.md) | Autenticação — JWT pós-delete | Corrigido |
| [005](./findings/005-idor-lead.md) | Autorização — IDOR Lead | Corrigido no código |
| [006](./findings/006-contrato-jwt.md) | Autenticação — contrato JWT (HS256/8h/claims) | Corrigido (ciclo 6) |
| [007](./findings/007-token-version-troca-senha.md) | Autenticação — JWT após troca de senha | Corrigido (ciclo 6) |
| [008](./findings/008-rate-limit-login.md) | Autenticação — rate limit no login | Corrigido (ciclo 6) |
| [009](./findings/009-timing-enumeracao-email.md) | Autenticação — timing / enum. de e-mail | Corrigido (ciclo 6) |
| [010](./findings/010-limites-senha-json.md) | Validação — senha max + JSON limit | Corrigido (ciclo 6) |
| [011](./findings/011-docker-non-root.md) | Deploy — container non-root | Corrigido no Dockerfile (ciclo 6) |
| [012](./findings/012-cors-helmet.md) | Deploy — CORS + Helmet | Corrigido (ciclo 7) |

Próximos candidatos: WhatsApp webhook, frontend, refresh token, OpenAPI.

## Como abrir um finding novo

Copia o template em `findings/_template.md`. Um finding = uma ameaça. Não mistura “também notei X”.
