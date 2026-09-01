# Finding 001

## Área
Autorização

## Código/Fluxo analisado
`POST /auth/register` era público (`src/routes/authRoutes.ts` → `authController.registrar` → `authService.registrar` → `criarUsuario(..., 'USER')`).

Qualquer cliente HTTP sem token criava um `Usuario` no Postgres e recebia JWT na hora.

O CRM é de **uma empresa só**. Conta = acesso ao perímetro interno (pelo menos o próprio recurso; se alguém fosse promovido depois, pior).

## Problema identificado
Self-registration aberto na internet. A API não distinguia “funcionário da empresa” de “desconhecido”.

Mesmo com role inicial `USER` e sem o antigo `count() === 0 → ADMIN`, o estranho já nascia no banco, já autenticava e já exercia o contrato de USER.

## Como o problema poderia acontecer
1. A API sobe no Render com URL pública.
2. Atacante (ou bot) descobre `POST /auth/register` por docs, histórico de commit, ou tentativa `/auth/*`.
3. Envia `{ "nome", "email", "senha" }` sem `Authorization`.
4. Recebe `201` + token. Passa a existir como usuário da empresa.

Não precisa de senha de ninguém. Não precisa de XSS. Só da rota.

## Risco
Acesso não autorizado ao tenant: criação ilimitada de contas, enumeração de e-mails (409 em e-mail duplicado), base para abuso do perfil USER e, se houver falha em promoção de role, caminho até ADMIN/OWNER.

## Por que isso é um risco?
Autorização começa em **quem pode existir**. Se o cadastro é público, o controle de role depois é tarde: o atacante já está dentro.

Num CRM interno isso quebra o modelo mental “só quem trabalha aqui tem login”. Rate limit e senha forte no register não resolvem — o ator nem deveria ter o endpoint.

## Mitigação estudada
- Superfície pública: só `POST /auth/login` e `GET /health`.
- Criação de conta: `POST /usuarios`, autenticado, `authorize` em staff (`CRM_OWNER`, `OWNER`, `ADMIN`).
- Conta nova sempre `USER`. Promoção só em `PATCH /usuarios/:id/role`.
- Dono do CRM não nasce por HTTP: seed/SQL.
- `role` no body de criação é ignorado (schema sem esse campo).

Review atacaria: `POST /auth/register` sem token (não pode 201); `POST /usuarios` sem token (401); `POST /usuarios` com token USER (403); `POST /usuarios` com token ADMIN + `role: OWNER` no body (nasce USER).

## Correção implementada
- Removido `POST /auth/register` e a cadeia `registrar` (rota, controller, service, `registerSchema`).
- `src/routes/authRoutes.ts` expõe só `POST /login`.
- `POST /usuarios` já estava atrás de `authenticate` + `authorize(...ROLES_STAFF)` e força `criarUsuario(..., 'USER')`.

## Como validei
- Busca em `src/`: nenhum `register` / `registrar` restante.
- `npx tsc --noEmit` após a mudança: exit 0.
- Validação HTTP ao vivo (curl no Render / server local) **ainda não rodou**.

## Status
Corrigido no código. Confirmação em runtime pendente.
