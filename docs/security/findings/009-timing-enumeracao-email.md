# Finding 009

## Área
Autenticação — timing / enumeração de e-mail no login

## Código/Fluxo analisado
`src/services/authService.ts` — early return se `!usuario` antes de `bcrypt.compare`.

## Problema identificado
E-mail inexistente respondia sem bcrypt → tempo denunciava se a conta existia.

## Como o problema poderia acontecer
Medir `time_total` de e-mails fake vs reais e montar lista de contas.

## Risco
Enumeração de usuários. OWASP **A07**.

## Mitigação estudada
Sempre `bcrypt.compare(senha, usuario?.senha ?? dummyHash)` (cost 10); sem `setTimeout` fixo.

## Correção implementada
- `getDummyHash()` lazy (bcrypt cost 10).
- Compare sempre; depois `!usuario || !senhaOk` → mesmo 401.

## Como validei
3 amostras: fake avg ~73 ms; real+senha errada avg ~77 ms (diferença residual, sem salto de “só DB”).

## Status
Corrigido e confirmado em runtime (ciclo 6).
