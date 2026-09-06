# Finding 003

## Área
Autorização — isolamento multi-tenant (IDOR)

## Código/Fluxo analisado
`GET/POST/PATCH/DELETE /usuarios` e `PATCH /usuarios/:id/role` após multiempresa.
Antes: `Usuario.role` global, sem `Empresa`. Qualquer staff via JWT listava/alterava qualquer UUID.

## Problema identificado
Sem `empresaId` no contexto, um OWNER da Empresa A com UUID de usuário da Empresa B fazia IDOR: leitura, alteração de role ou delete cross-tenant.

## Como o problema poderia acontecer
1. Atacante é OWNER na Empresa A (token legítimo).
2. Obtém UUID de usuário da Empresa B (vazamento, enumeração, log).
3. `GET /usuarios/<uuid-B>` ou `DELETE` / `PATCH .../role`.
4. Sem filtro por tenant, a API operava no registro global.

## Risco
Vazamento e alteração de contas de outro cliente (quebra o modelo White Label / SaaS).

## Por que isso é um risco?
Num CRM multiempresa, o perímetro é o tenant. Authn sem isolamento de tenant = autorização incompleta.

## Mitigação estudada
- `Empresa` + `MembroEmpresa` (role por empresa).
- JWT carrega `empresaId` ativo.
- Toda query de usuário resolve membership `(usuarioId, empresaId)` do token.
- Alvo fora do tenant → 404 (não vaza existência cross-tenant).
- `CRM_OWNER` de plataforma usa `empresaId` no login para operar um tenant.

Review atacaria: token Empresa A + UUID Empresa B (404); listagem só retorna membros do tenant; criar usuário nasce `USER` só na empresa do token.

## Correção implementada
- Schema: `Empresa`, `MembroEmpresa`, `Usuario.isCrmOwner`; `role` sai de `Usuario`.
- `usuarioService` exige `empresaId` e filtra por membership.
- `POST /empresas` só `CRM_OWNER`.
- Login B: 1 membership → JWT; N → 409 + lista; `empresaId` opcional no body.

## Como validei
Bateria HTTP local (curl): criar 2 empresas, usuário em A, token de A não lê UUID de B (404); listagens isoladas.

## Status
Corrigido e confirmado em runtime (bateria ciclo 4: IDOR cross-tenant → 404; listagens isoladas).
