# `src/pages/contas-a-pagar.tsx`

## Descrição

Página de **gestão de contas a pagar** (`/contas-a-pagar`): cadastro/edição, pagamento, cancelamento de pagamento, exclusão, filtros, importação de XML de NF-e, backup, agenda mensal e resumo anual.

## Contexto

Rota `/contas-a-pagar` (componente `ContasAPagar`). Orquestra o estado e renderiza os submódulos `ContasAPagarHeader`, `ContasAPagarFilterPanel`, `ContasAPagarForm`, `ContasAPagarLastTen`, `Agenda`, `Resumo` e `ContasAPagarModals`.

## Estado principal

- **Período:** `ano`, `mes` (defaults de `getDateArray()`, hoje).
- **Listas:** `contasMes` (`buscarContas(ano, mes)`), `contasAno` (`buscarContas(ano)`).
- **Formulário:** `distribuidora`, `valor` (string), `vencimento` (default hoje), `documento`, `bancoObservacoes`, `editingConta`.
- **Seleção/pagamento:** `selectedConta`, `payModalOpen`, `payObservacao`.
- **Filtros:** `filtroDistribuidora`, `filtroStatus` (`'Todos'|'Pendente'|'Pago'`), `filtroVencimentoDe/Ate` (persistidos em `localStorage['filtroVencimentoDe'/'filtroVencimentoAte']`; se `De > Ate`, iguala `Ate = De`, e vice-versa).
- **Toast:** `toastOpen`, `toastMessage`, `toastType`.

## Funções principais

- `loadContasMes()` / `loadContasAno()` — carregam as listas via `buscarContas`.
- `handleSubmit(e)` — valida `distribuidora`, `valor` (não vazio, numérico `> 0`), `vencimento`, `documento` (usa `highlightField` nos refs); chama `atualizarConta` (edição) ou `registrarConta` (novo, checando `response.error`); recarrega tudo.
- `handleEditar(conta)` — preenche o formulário e foca `distribuidoraInputRef`; `handleCancelarEdicao()` = `resetForm`.
- `handleView(conta)` — abre modal de detalhes.
- `handleDelete(id)` — exclui e recarrega (limpa `selectedConta` se for o mesmo).
- `handleConfirmarPagamento()` — `atualizarConta(..., payObservacao)` + `pagarConta(id)`, fecha modal e recarrega (observação gravada antes do pagamento).
- `handlePagar(id)` / `handleCancelarPagamento(id)` — ações diretas.
- `handleBackup()` — `fazerBackupContas()`.
- `handleImportXML()` — cria `<input type="file" accept=".xml">` dinâmico, lê o texto e faz `fetch('/api/contas/import')`; no sucesso recarrega listas e `queryClient.invalidateQueries({ queryKey: ['notas'] })`.
- `filteredContas` (memo) — filtra `contasAno` por distribuidora (case-insensitive), status e intervalo de vencimento.
- `ultimasContas` (memo) — top **10** de `contasAno` ordenadas por `criado_em` decrescente (`toTimestamp`).
- `useShortcuts(['Escape'], ...)` — limpa o formulário com Escape.

## Dependências

- `src/services/contasService`, `src/components/*` (ContasAPagar*, Agenda, Resumo, Toast).
- `src/utils`: `number` (`parseNumber`), `forms` (`highlightField`), `shortcuts` (`useShortcuts`), `date` (`getDateArray`, `toTimestamp`, `now`).
- `@tanstack/react-query` (`useQueryClient`), `dayjs`.

## Observações

- Formulário valida apenas campos obrigatórios básicos; regras de data/valor podem ser reaproveitadas de `src/utils/validation`.
- A duplicação (distribuidora+documento) é rejeitada pela API apenas na criação.
- A observação de pagamento é persistida via `atualizarConta` **antes** de `pagarConta`; cancelar pagamento não restaura observação anterior.
- `handleImportXML` usa `document.createElement('input')` (DOM direto) — exceção pontual ao padrão "sem DOM direto".