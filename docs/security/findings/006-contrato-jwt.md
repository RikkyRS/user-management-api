# Finding 006

> Substitui o preenchimento de `002-autenticacao-jwt.md` (arquivo protegido / vazio no envelope do ciclo 6).

## Área
Autenticação — contrato do JWT (algoritmo, TTL, claims)

## Código/Fluxo analisado
`src/lib/jwt.ts` (`criarToken` / `lerToken`) + `authenticate` + `POST /auth/login`.

## Problema identificado
Sem finding explícito do **contrato** do token, fica fácil drift: claims extras, TTL longo demais, alg fraco, ou confiar só no payload sem revalidar no banco.

## Como o problema poderia acontecer
1. Alguém muda `exp` para 30d “por DX”.
2. Ou passa a confiar em `role` do JWT sem olhar membership.
3. Ou emite token sem contexto mínimo (`sub`).

## Risco
Sessão longa demais; privilege escalation se o claim for a única fonte de verdade; tokens opacos demais pra auditar.

## Por que isso é um risco?
JWT é a fronteira de identidade. Sem contrato escrito + finding, hardening (tokenVersion, sessão viva) vira patch solto.

## Mitigação estudada (contrato congelado)

| Campo | Valor |
|---|---|
| Algoritmo | **HS256** (`jose`) |
| Segredo | `JWT_SECRET` (env; obrigatório) |
| TTL | **8h** (`setExpirationTime('8h')`) |
| `sub` | `Usuario.id` |
| `role` | claim informativo no emit; **efetivo vem do DB** no `authenticate` |
| `empresaId` | opcional (CRM_OWNER); obrigatório no fluxo de membership |
| `tokenVersion` | claim inteiro; deve bater com `Usuario.tokenVersion` (Finding 007) |

Review atacaria: token sem `sub` / role inválida / `tokenVersion` ausente → 401; token expirado → 401; role no JWT desatualizada vs membership → usa role do banco.

## Correção implementada
- Contrato documentado neste finding.
- `src/lib/jwt.ts` emite/valida `tokenVersion` (obrigatório no payload).
- Sessão viva + role do DB permanecem (Finding 004).

## Como validei
Login 200 com JWT HS256 contendo `role`, `tokenVersion`, `empresaId`; request autenticada 200.

## Status
Corrigido e confirmado em runtime (ciclo 6).
