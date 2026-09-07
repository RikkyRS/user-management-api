# Finding 007

## Área
Autenticação — JWT válido após troca de senha

## Código/Fluxo analisado
`PUT/PATCH /usuarios/:id` (campo `senha`) + `authenticate` + `criarToken`.

## Problema identificado
Token roubado ou sessão antiga continuava válido até `exp` (8h) mesmo depois da troca de senha.

## Como o problema poderia acontecer
1. Atacante tem JWT.
2. Vítima / staff troca a senha.
3. Atacante segue autenticado até o TTL.

## Risco
Acesso pós-compromisso / pós-reset. OWASP **A07**.

## Por que isso é um risco?
Trocar senha é o gesto de “revogar sessão”. Sem `tokenVersion`, o gesto mente.

## Mitigação estudada
- `Usuario.tokenVersion Int @default(0)`.
- Login embute `tokenVersion` no JWT.
- Update com `senha` faz `tokenVersion: { increment: 1 }`.
- `authenticate`: claim ≠ banco → 401.

## Correção implementada
- Migration `20260907152000_add_token_version`.
- `usuarioService` incrementa em PUT/PATCH com senha.
- `jwt.ts` + `authenticate` comparam versão.

## Como validei
USER login → PATCH senha (staff) → request com token antigo → **401**; login com senha nova → **200**.

## Status
Corrigido e confirmado em runtime (ciclo 6).
