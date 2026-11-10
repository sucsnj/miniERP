# `src/services/notasService.ts`

> Cliente HTTP via `fetch` para o domínio de notas fiscais (endpoint interno `/api/notas`).

## O que faz

- Expõe `InvoiceDetails` (distribuidora, chave, data_emissao `YYYY-MM-DD`, valor_nota).
- Lista notas por período (`fetchInvoicesByPeriod`), busca por valor (`fetchInvoiceByAmount`), lista todas (`fetchAllInvoices`) e exclui (`deleteInvoice`).
- Retorna `null` em `fetchInvoiceByAmount` quando a API responde com status 404.

## Relações

- **Usa:** [`/api/notas`](../pages/api/notas.md)
- **Usado por:** páginas/fluxos que manipulam notas fiscais

## Notas

- `fetchInvoiceByAmount` envia `valor` via query string e trata 404 como "não encontrada".
- `data_emissao` é retornada como string (formato YYYY-MM-DD conforme API/DB).