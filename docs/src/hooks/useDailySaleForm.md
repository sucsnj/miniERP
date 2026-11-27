# `src/hooks/useDailySaleForm.ts`

> Hook que centraliza estado, validacao, acoes e efeitos do formulario de venda diaria.

## O que faz

- Gerencia campos (`value`, `observations`), calculo da expressao (`src/lib/calc/calculator.ts`), loading e estado do PIX (`pixModalOpen`, `pixPayload`, `pixAmount`).
- Integra carrinho via `useCart(showToast)`, sincroniza total do carrinho com campo (adiciona/remove `"+valor_carrinho"`).
- Handlers: `handleKeyDown` (filtro de teclas), `handleValueChange` (sanitiza e preserva cursor), `handlePixClick` (valida e gera payload EMVCo; exige `pixKey`, `pixName`, `pixBank` e `pixCity` em `useSettings`; cria PIX com valor livre quando não há valor avaliável no campo de venda (vazio, zero ou expressão incompleta)), `handleSubmit` (valida, registra via `useCreateSale`, limpa/foca), `handleClear`, `addOperator(op)`.
- Expoe `isValueInvalid` para indicar expressao invalida.
- Ao concluir o registro com sucesso, volta o foco automaticamente para o campo Valor (habilitado de novo) e seleciona seu conteúdo.
- Sempre que a rota `/` termina de carregar completamente (`pendingCount === 0`), o foco vai para o campo Valor; este comportamento é estrutural e não depende da configuração `autoFocusSaleInput`.
- Bloqueia envio enquanto uma submissão está em andamento e limpa o formulário imediatamente; em falha, restaura os dados somente se o usuário não digitou nada novo.
- Envia `idempotencyKey` estável por tentativa do mesmo rascunho na criação de venda; falha desconhecida seguida de retry não registra a venda duas vezes.
- Efeitos: ESC limpa formulário (ignorado enquanto `useFocusTrap` marca `body.modal-open`), auto-foco/visibilidade do input via `useAutoFocus` e atualizações por carrinho.
- Recebe `isEditing`: enquanto `true`, o auto-foco automático (`useAutoFocus`) fica suspenso; ao transicionar de `true` para `false` (salvar ou cancelar a edição), o foco e a seleção voltam ao campo Valor.

## Relacoes

- **Usa:** `useCreateSale` (`src/hooks/useSalesMutations.ts`), `useShortcuts` (`src/utils/shortcuts.ts`), `validateRequired/validateCurrency/validateDate` (`src/utils/validation.ts`), `highlightField` (`src/utils/forms.ts`), `parseCurrency` (`src/utils/number.ts`), `buildPixPayload` (`src/utils/pix.ts`), `src/lib/calc/calculator.ts`, `useCart`, `useToast`, `useAutoFocus`, `useSettings`, `useRouteLoading`.
- **Usado por:** `src/components/sales/DailySaleForm.tsx` (apresentacional).

## Notas

- Identificadores renomeados ao tocar no modulo (ADR 0004): `valor` -> `value`, `observacoes` -> `observations`, `limpando` -> `clearing`.
- Mantem refs para foco e navegacao (`valueInputRef`, `observationsTextareaRef`, `formRef`).
- A sincronizacao do carrinho usa separador decimal com ponto, igual ao estado do input.
