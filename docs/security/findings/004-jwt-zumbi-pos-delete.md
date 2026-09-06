# Finding 004

## Área
Autenticação — JWT zumbi após delete / perda de membership

## Código/Fluxo analisado
`authenticate` + `DELETE /usuarios/:id`.
Antes: middleware só fazia `jwtVerify`. Usuário deletado mantinha Bearer válido até `exp` (8h).

## Problema identificado
Token “morto” (conta ou vínculo com a empresa já removidos) continuava autenticando. OWNER excluía o USER e o USER ainda chamava a API.

## Como o problema poderia acontecer
1. Staff deleta (ou remove membership de) um USER.
2. USER ainda tem JWT antigo no cliente.
3. `GET /usuarios/me`-equivalente / rotas autenticadas → 200 até expirar.

## Risco
Acesso pós-revogação: dados do tenant, ações enquanto o token viver.

## Por que isso é um risco?
Revogação de acesso tem que ser imediata no modelo de sessão. JWT stateless puro sem check de existência = desligamento mentiroso.

## Mitigação estudada
- Após `jwtVerify`: carregar `Usuario` pelo `sub` → ausente → 401.
- Se não `isCrmOwner`: exigir `MembroEmpresa(usuarioId, empresaId)` → ausente → 401.
- `role` efetiva vem do banco (membership / flag), não só do claim.
- Delete remove membership; se zero memberships e não CRM_OWNER, apaga `Usuario`.

Review atacaria: login → guardar token → staff deleta → mesma request autenticada → 401; remover só membership de um tenant → token daquele `empresaId` → 401.

## Correção implementada
- `src/middlewares/authenticate.ts` sessão viva (DB a cada request).
- `deletarUsuario` remove membership (+ conta se última).

## Como validei
Bateria HTTP: delete USER → request com token antigo → 401.

## Status
Corrigido e confirmado em runtime (bateria ciclo 4: delete USER → token antigo → 401).
