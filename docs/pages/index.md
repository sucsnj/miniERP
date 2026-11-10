# `src/pages/index.tsx`

## Descrição

Página principal — **Dashboard de Vendas**. Exibe o resumo do período, formulário de registro de venda diária, edição, gráfico, exportação e ações de consolidação/backup.

## Responsabilidades

- Manter o período selecionado (`mes`, `ano` + campo de texto `anoInput` com commit apenas de valores válidos) e a `selectedDate` do formulário.
- Carregar as vendas do mês via `useVendas` sempre que `loadSales` mudar (período).
- Calcular `recentSales`: últimas 4 vendas, ordenadas por data desc e depois id desc.
- Renderizar e orquestrar os subcomponentes da tela.
- Exibir notificações via `Toast`.

## Componentes

- `DailySalesTotal` — encapsula `DailySaleForm` como filho e recebe `recentSales`, `onEditSale`, `onDeleteSale`.
- `DailySaleForm` — formulário de venda do dia (`showHistory={false}`).
- `EditSaleForm` — renderizado somente quando `editingSale` está definido.
- `SalesChart` — gráfico com `data={sales}`.
- `ExportButtons` — exportação/importação (com `onImportCompleted={loadSales}`).
- `Toast` — notificações (posição `top-right`).
- `SalesTable` — **comentado** no JSX (não renderizado atualmente).
- Rodapé: seletores de mês/ano + botões "Consolidar Mês" e "Fazer Backup".

## Estado e Funções Principais

- `mes`, `ano`, `anoInput` — filtro do período; `selectedDate` — data do formulário.
- `loadSales()` — recarrega as vendas (via `useVendas(mes, ano, showToast)`).
- `handleConsolidate()` / `handleBackup()` — dispara consolidação e backup.
- `handleEditSale()` — abre a edição; `handleSaved()` / `handleCancelEdit()` — fecha e recarrega.
- `handleDeleteSale(id)` — exclui (respeitando janela de 2 dias).
- `showToast` / `closeToast` — controle do toast.

## Dependências

- `useToast`, `useVendas` (`src/hooks/*`).
- Utilitários: `capitalize`, `getDateArray`, `now`, `toTimestamp`, `formatMonthName`.

## Observações

- O filtro carregado é o padrão do `useVendas` (`filtro: 'positivas'`).
- A data inicial do formulário é hoje no fuso do app (`America/Recife`).