# `src/lib/calc/calculator.ts`

> Calculadora customizada do campo de valor de vendas.

## O que faz

- Valida e insere teclas (`insertKey`), remove (`deleteKey`) e sanitiza expressões (`sanitizeExpression`).
- O primeiro caractere só pode ser número, `-`, `(`, ponto ou vírgula; vírgula/ponto sem parte inteira gera `0.` (ex.: `,8` → `0.8`).
- Avalia expressões com precedência, parênteses e sinal unário (`calculate`/`calculateResult`).
- Aceita multiplicação implícita (`2(3)`, `(2)3`, `(2)(3)`).
- Usa `roundCurrency` de `engine.ts`.

## Relações

- **Usa:** `src/lib/calc/engine.ts`.
- **Usado por:** `src/hooks/useDailySaleForm.ts` e `src/utils/calculator.ts`.

## Notas

- É a referência mainBarcode de cálculo do formulário de venda diária.
- Sinal final não invalida a expressão: o cálculo parcial possível é exibido.
- `(` incompleta é tolerada: `(2+3` vira 5 e `4*(2` vira 8; `5*(` vira 5 (remove operador pendente + abre irrelevante).
- `+`, `-`, `*`, `/` e `)` substituem o último caractere se ele for um desses símbolos; `-` após outro operador substitui o operador anterior.
- Menos no início é aceito (`-5`) e expressões começam por negativo.
