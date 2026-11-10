# `src/services/contasService.ts`

> Cliente HTTP via `fetch` para o domínio de contas a pagar (endpoints internos `/api/contas*`).

## O que faz

- Expõe `AccountDetails` com campos de conta a pagar (vencimento `YYYY-MM-DD`, status `Pendente`/`Pago`).
- Faz chamadas REST/ação para listar, criar, importar XML, pagar/cancelar, atualizar, excluir e gerar backup.
- Retorna `response.json()` sem lançar erro (a página valida `error`/`message`).

## Relações

- **Usa:** [`/api/contas`](../pages/api/contas.md), [`/api/contas/import`](../pages/api/contas/import.md), [`/api/contas/backup`](../pages/api/contas/backup.md)
- **Usado por:** componentes/páginas de Contas a Pagar ([`docs/src/pages/contas-a-pagar.md`](../pages/contas-a-pagar.md))

## Notas

- `fetchAccounts(year, month?)` monta `URLSearchParams` e omite `month` quando não informado.
- Ações `pagar`/`cancelar` são enviadas via `POST /api/contas` com `{action, id}` (sem rota REST dedicada).
- Duplicidade `distribuidora+documento` é tratada pela API e retornada no JSON.