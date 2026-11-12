# `src/services/invoicesService.ts`

> Cliente HTTP via `fetch` para o domínio de notas fiscais (endpoint interno `/api/notas`).

## O que faz

- Expõe `InvoiceDetails` (distribuidora, chave, data_emissao `YYYY-MM-DD`, valor_nota).
- Lista notas por período (`fetchInvoicesByPeriod`), busca por valor (`fetchInvoiceByAmount`), lista todas (`fetchAllInvoices`) e exclui (`deleteInvoice`).
- Envia e recebe payloads tipados; `parseResponse<T>` lanca `Error` em `!response.ok` (callback `useDeleteInvoice` usa rollback).
- Mapeia resposta para `InvoiceDetails` (normaliza `chave`/`access_key`).

## Relações

- **Usa:** [`/api/notas`](../pages/api/invoices.md)
- **Usado por:** páginas/fluxos que manipulam notas fiscais

## Notas

- `fetchInvoiceByAmount` envia `valor` via query string e trata 404 como "não encontrada".
- `data_emissao` é retornada como string (formato YYYY-MM-DD conforme API/DB).