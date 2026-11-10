# `src/hooks/useDailySaleForm.ts`

> Hook que centraliza estado, validacao, acoes e efeitos do formulario de venda diaria.

## O que faz

- Gerencia campos (`value`, `observations`), calculo da expressao (`src/lib/calc/calculator.ts`), loading e estado do PIX (`pixModalOpen`, `pixPayload`, `pixAmount`).
- Integra carrinho via `useCart(showToast)`, sincroniza total do carrinho com campo (adiciona/remove `"+valor_carrinho"`).
- Handlers: `handleKeyDown` (filtro de teclas), `handleValueChange` (sanitiza e preserva cursor), `handlePixClick` (valida e gera payload EMVCo), `handleSubmit` (valida, registra via `registerSale`, limpa/foca), `handleClear`, `addOperator(op)`.
- Expoe `isValueInvalid` para indicar expressao invalida.
- Efeitos: ESC limpa formulario, auto-foco/visibilidade do input e atualizacoes por carrinho.

## Relacoes

- **Usa:** `registerSale` (`src/services/vendasService.ts`), `useShortcuts` (`src/utils/shortcuts.ts`), `validateRequired/validateCurrency/validateDate` (`src/utils/validation.ts`), `highlightField` (`src/utils/forms.ts`), `parseCurrency` (`src/utils/number.ts`), `buildPixPayload` (`src/utils/pix.ts`), `src/lib/calc/calculator.ts`, `useCart`, `useToast`.
- **Usado por:** `src/components/sales/DailySaleForm.tsx` (apresentacional).

## Notas

- Identificadores renomeados ao tocar no modulo (ADR 0004): `valor` -> `value`, `observacoes` -> `observations`, `limpando` -> `clearing`.
- Mantem refs para foco e navegacao (`valueInputRef`, `observationsTextareaRef`, `formRef`).
- A sincronizacao do carrinho usa separador decimal com ponto, igual ao estado do input.
