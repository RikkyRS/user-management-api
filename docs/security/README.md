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
| [003](./findings/003-isolamento-tenant.md) | Autorização — IDOR multi-tenant | Corrigido |
| [004](./findings/004-jwt-zumbi-pos-delete.md) | Autenticação — JWT pós-delete | Corrigido |
| [005](./findings/005-idor-lead.md) | Autorização — IDOR Lead | Corrigido no código |

Próximos candidatos: rate limit no login, `tokenVersion` na troca de senha, timing de e-mail, senha sem `max`, WhatsApp webhook, paginação.

## Como abrir um finding novo

Copia o template em `findings/_template.md`. Um finding = uma ameaça. Não mistura “também notei X”.
