# Secure API — trilho de AppSec

Este repositório é a API de um CRM (Express + TypeScript + Prisma + JWT).
O diferencial não é só “ter auth”: é provar, finding a finding, o ciclo:

```text
Threat Model
     ↓
Possíveis ameaças
    10|     ↓
Riscos
     ↓
Mitigações
     ↓
Implementação
     ↓
Finding (evidência)
```

Cada peça (cadastro, role, login, health, secrets, tenant) entra por aqui **antes** de virar feature nova.

## Superfície atual

| Superfície | Quem acessa | Ameaça típica |
|---|---|---|
| `POST /auth/login` | público | brute force, enumeração, JWT zumbi |
| `GET /health` | público | info disclosure (hoje não vaza dado) |
| `POST /empresas` | CRM_OWNER | criação indevida de tenant |
| `POST /usuarios` | staff + contexto empresa | criação cross-tenant |
| `PATCH /usuarios/:id/role` | CRM_OWNER / OWNER | privilege escalation |
| `GET/PUT/PATCH/DELETE /usuarios...` | autenticado + tenant | IDOR cross-tenant |
| Banco / `.env` | deploy | secret leak, CRM_OWNER clonado |

Roles: `CRM_OWNER` (plataforma, `isCrmOwner`) → membership `OWNER` → `ADMIN` → `USER` **por empresa**.

## Findings

| ID | Área | Status |
|---|---|---|
| [001](./findings/001-cadastro-publico.md) | Autorização — cadastro público | Corrigido |
| [003](./findings/003-isolamento-tenant.md) | Autorização — IDOR multi-tenant | Corrigido no código |
| [004](./findings/004-jwt-zumbi-pos-delete.md) | Autenticação — JWT pós-delete | Corrigido no código |

Próximos candidatos: rate limit no login, troca de senha → invalidar sessão (`tokenVersion`), timing de e-mail no login, senha sem `max` (DoS no bcrypt), review de frontend (quando existir).

## Como abrir um finding novo

Copia o template em `findings/_template.md`. Um finding = uma ameaça. Não mistura “também notei X”.
