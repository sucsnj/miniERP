# `src/utils/forms.tsx`

> Manipulação de classes de campos de formulário (realce e mostrar/ocultar).

## O que faz

- `highlightField(ref)` foca o campo e adiciona `errorHighlight` até o usuário digitar.
- `hideField`/`showField(ref, flag)` alternam a classe `hidden` por `ref`.
- `hideFieldByClass`/`showFieldByClass(className, flag)` fazem o mesmo por classe CSS.

## Relações

- **Usado por:** `useDailySaleForm` e página `contas-a-pagar`.

## Notas

- Sem lógica de validação (ADR 0002); apenas DOM/UI.
