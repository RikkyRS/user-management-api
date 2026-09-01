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

Cada peça (cadastro, role, login, health, secrets) entra por aqui **antes** de virar feature nova.

## Superfície atual

| Superfície | Quem acessa | Ameaça típica |
|---|---|---|
| `POST /auth/login` | público | brute force, enumeração de e-mail |
| `GET /health` | público | info disclosure (hoje não vaza dado) |
| `POST /usuarios` | CRM_OWNER, OWNER, ADMIN | criação de conta por quem não é staff |
| `PATCH /usuarios/:id/role` | CRM_OWNER / OWNER (regras) | privilege escalation |
| `GET/PUT/PATCH/DELETE /usuarios...` | autenticado + hierarquia | IDOR, delete do dono |
| Banco / `.env` | deploy | secret leak, CRM_OWNER clonado |

Roles: `CRM_OWNER` (1, seed/SQL) → `OWNER` → `ADMIN` → `USER`.
Não existe tabela de empresa (um tenant).

## Findings

| ID | Área | Status |
|---|---|---|
| [001](./findings/001-cadastro-publico.md) | Autorização — cadastro público | Corrigido no código |

Próximos candidatos (review interno, ainda sem finding escrito):
rate limit no login, token JWT após delete/troca de senha, timing de e-mail no login, senha sem `max` (DoS no bcrypt).

## Como abrir um finding novo

Copia o template em `findings/_template.md`. Um finding = uma ameaça. Não mistura “também notei X”.
