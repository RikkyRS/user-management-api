# Finding 010

## Área
Validação / DoS — senha sem `max` + `express.json` sem limit

## Código/Fluxo analisado
Schemas Zod de senha + `src/app.ts` `express.json()`.

## Problema identificado
Senha gigante + bcrypt = DoS de CPU; JSON enorme = DoS de memória.

## Como o problema poderia acontecer
`POST /auth/login` ou `/usuarios` com senha/string absurda ou body de dezenas de KB+.

## Risco
DoS. OWASP **A04** / **A05**.

## Mitigação estudada
`senha.max(128)`; `express.json({ limit: '32kb' })`; 413 no overflow.

## Correção implementada
- `user.schema` + `auth.schema` com `.max(128)`.
- `express.json({ limit: '32kb' })`.
- `errorHandler` → 413 `Payload muito grande`.

## Como validei
Senha 129 chars → **400** Zod; body ~40 kb → **413**.

## Status
Corrigido e confirmado em runtime (ciclo 6).
