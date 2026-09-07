# Finding 008

## Área
Autenticação — rate limit em `POST /auth/login`

## Código/Fluxo analisado
`src/routes/authRoutes.ts` → login público.

## Problema identificado
Login aceitava tentativas ilimitadas por IP → brute force / credential stuffing.

## Como o problema poderia acontecer
Script dispara milhares de `POST /auth/login` com wordlist sem 429.

## Risco
Compromisso de conta; DoS de CPU via bcrypt. OWASP **A07** (+ **A04**).

## Mitigação estudada
`express-rate-limit`: **100 req / 15 min / IP** só no login; **429**.

## Correção implementada
- Dep `express-rate-limit`.
- Middleware em `authRouter.post('/login', loginRateLimit, login)`.

## Como validei
Headers `RateLimit-Limit: 100` e `RateLimit-Remaining` presentes na resposta do login.

## Status
Corrigido e confirmado em runtime (ciclo 6).
