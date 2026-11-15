# `src/components/payables/PayablesModals.tsx`

> Modal de contas a pagar: detalhes read-only com edição inline por campo e status via dropdown.

## O que faz

- **Detalhes**: abre no padrão dos modais de carrinho/PIX e mostra Distribuidora, Valor, Vencimento, Documento, Status e Banco/Observações.
- O modal controla um único campo ativo; ao clicar em outro campo, a edição anterior é cancelada automaticamente.
- Confirmação de um campo salva imediatamente (`onUpdateField`) e o pai atualiza o objeto `selectedAccount`.
- Status é um dropdown; `hover`/`focus` no status exibe as observações da conta (ou `Pago`/`Pendente` quando vazio). Escolher outro valor executa `onStatusChange`, tratando a conta como paga/pendente.
- O botão de pagar/cancelar não fica mais no rodapé; o rodapé mantém apenas "Fechar".

## Relações

- **Usa:** [AppModalShell](../common/AppModalShell.md), [InlineAccountField](./InlineAccountField.md), `AccountDetails`, `formatCurrency`, `formatDateString`, `payables.module.css`.
- **Usado por:** [Payables](../../pages/payables.md).

## Notas

- O modal não depende de formulário compartilhado: cada campo envia sua própria atualização.
- Edição de status desabilita durante a ação remota (`statusBusy`).
