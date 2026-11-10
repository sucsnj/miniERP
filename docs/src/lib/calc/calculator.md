# `src/lib/calc/calculator.ts`

> Calculadora customizada do campo de valor de vendas.

## O que faz

- Valida e insere teclas (`insertKey`), remove (`deleteKey`) e sanitiza expressões (`sanitizeExpression`).
- Avalia expressões com precedência, parênteses e sinal unário (`calculate`/`calculateResult`).
- Aceita multiplicação implícita (`2(3)`, `(2)3`, `(2)(3)`).
- Usa `roundCurrency` de `engine.ts`.

## Relações

- **Usa:** `src/lib/calc/engine.ts`.
- **Usado por:** `src/hooks/useDailySaleForm.ts` e `src/utils/calculator.ts`.

## Notas

- É a referência principal de cálculo do formulário de venda diária.
- Sinal final não invalida a expressão: o cálculo parcial possível é exibido.
- O sinal de menos unário é suportado em qualquer posição válida.
