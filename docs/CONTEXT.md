# Contexto Rápido para Agentes

> Este documento exists para que o agente entenda o projeto sem reler o código. Complementa `docs/README.md` (índice completo) e `docs/DOCS.md` (arquitetura). O estado atual do projeto (pendentes e futuras) fica em `PROJECT_STATUS.md` (raiz).

## O que é este projeto

Sistema de gestão de vendas (Next.js 16 + React 19 + TypeScript). Aplicação single-app: frontend e API interna rodam no mesmo processo; a persistência oficial é o Supabase/Postgres (ADR 0012). A autenticação própria e o isolamento multiempresa/multi-loja foram definidos no ADR 0013; auth core está implementado, enforcement tenant/permissões seguem em rollout.

## Pilha mainBarcode

- **Next.js 16** — páginas em `src/pages/` e API interna em `src/pages/api/`.
- **React 19** + **MUI** (`@mui/material`, `@emotion`) para UI.
- **@tanstack/react-query** — cache/estado de servidor no cliente.
- **@supabase/supabase-js** — persistência remota no Supabase (acesso server-only via API routes).
- **dayjs** — datas (timezone padrão `America/Recife`).
- **recharts** — gráficos; **jspdf/html2canvas** — PDF; **xlsx** — planilhas.
- **multer + pdf2pic + sharp + tesseract.js** — upload e OCR de notas.

## Camadas (onde mora cada coisa)

- `src/pages/*.tsx` — rotas/páginas que orquestram tudo.
- `src/components/<domínio>/*.tsx` — UI agrupada por domínio (ADR 0005): `cart/` (carrinho), `sales/` (vendas do dia), `summary/` (resumo/consolidação), `payables/` (contas a pagar + agenda), `products/` (catálogo/estoque), `catalog/` (modal genérico dos cadastros auxiliares), `import/` (importação XML/OCR), `pix/` (PIX), `common/` (Nav, Toast, ConfirmDialog, BarcodeManager). Arquivos e identificadores internos em inglês (ADR 0004).
- `src/hooks/*.ts` — hooks de estado (flat): carrinho, filtros, toasts, CRUD de catálogo. Arquivos e identificadores exportados em inglês (ADR 0004).
- `src/services/*.ts` — cliente `fetch` para os endpoints internos.
- `src/pages/api/**/*.ts` — endpoints REST internos.
- src/database/*Repository.ts — repositórios Supabase (vendas, produtos, payables/invoices, histórico de tabela).
- `src/utils/*.ts(x)` — formatação, validação, datas, números, cores.
- `src/types/*.ts` — tipos compartilhados.
- `src/styles/` — `tokens.css` (design tokens e temas `data-theme`), `base.css` (reset/elementos), `utilities.css` (utilitários), `legacy.css` (CSS global em migração) e `*.module.css` (estilos por componente; tipagem gerada em `*.d.css.ts`).
- `docs/src/**/*.md` — documentação espelhando `src/` (mesmo caminho e nome, `.ts`/`.tsx` → `.md`; template único em `docs/documentation-guidelines.md`, validado por `node scripts/check-docs.mjs`).

## Bancos de dados

Banco oficial: Supabase/Postgres (schema public, UUID, nomes em inglês, RPCs). A infra de acesso está em src/database/supabase.ts + src/utils/env.ts.

> Migração SQLite → Supabase concluída (Fases 0 a 4, ADR 0012). O SQLite não é mais usado pela aplicação.

## Páginas principais

- `/` — dashboard de vendas do mês: formulário, gráfico, totais, edição e backup.
- `/historico` — histórico e busca de vendas passadas.
- `/resumo` — consolidação mensal e totais.
- `/payables` — gestão e importação de contas a pagar.
- `/medicine-table` — upload e consulta da tabela de medicamentos.
- `/products` — catálogo, estoque, preços e movimentações.
- `/registration` — cadastros auxiliares (categorias, marcas, fornecedores, unidades de medida, etc.).

## Tema → Documentos para ler

| Se você vai mexer em... | Leia primeiro |
| --- | --- |
| Alinhamento / domínio / refatoração | `docs/ALIGNMENT.md` (domínio, usuários, fluxos, pontos de atenção) |
| Arquitetura geral / fluxo de dados | `docs/DOCS.md` |
| Dashboard / vendas do dia | `docs/src/pages/index.md`, `docs/src/pages/api/sales.md`, `docs/src/pages/api/sale-items.md`, `docs/src/services/salesService.md` |
| Histórico / relatórios | `docs/src/pages/history.md`, `docs/src/pages/summary.md`, `docs/src/pages/api/monthly-sales.md` |
| Contas a pagar | `docs/src/pages/payables.md`, `docs/src/database/contasDb.md`, `docs/src/services/payablesService.md`, `docs/src/pages/api/payables.md`, `docs/src/pages/api/payables/import.md`, `docs/src/pages/api/contas/backup.md` |
| Produtos / estoque | `docs/src/pages/products.md`, `docs/src/database/productsDb.md`, `docs/src/pages/api/products.md`, `docs/src/pages/api/products/*.md`, `docs/src/services/productsService.md` |
| Cadastros auxiliares | `docs/src/pages/registration.md`, `docs/src/components/catalog/*.md`, `docs/adr/0008-modais-de-catalogo-e-confirmacao-compartilhada.md` |
| PIX / pagamento | `docs/src/components/pix/PixModal.md`, `docs/src/utils/pix.md` |
| Carrinho de compras | `docs/src/components/cart/CartModal.md`, `docs/src/hooks/useCart.md` |
| Formulários de venda (dia/item) | `docs/src/components/sales/DailySaleForm.md`, `docs/src/components/products/ItemForm.md`, `docs/src/components/sales/EditSaleForm.md` |
| OCR / importação | `docs/src/pages/api/ocr.md`, `docs/src/services/ocrService.md`, `docs/src/services/pdfService.md`, `docs/src/components/import/OcrUpload.md` |
| Tabela de medicamentos | `docs/src/pages/medicine-table.md`, `docs/src/database/medicine-tableDb.md` |
| Notas fiscais | `docs/src/pages/api/invoices.md`, `docs/src/database/notasDb.md` |
| Backup | `docs/src/pages/api/backup.md`, `docs/src/pages/api/contas/backup.md` |
| Componente/hook/util específico | navegar em `docs/src/` pelo mesmo caminho do arquivo em `src/` |
| Validação de campos / formulários | `docs/adr/0002-padrao-de-validacao-de-campos.md`, `docs/src/utils/validation.md` e `docs/src/utils/forms.md` |
| Notificações / toast | `docs/src/components/common/Toast.md` (+ `Toaster.md`), `docs/src/utils/toast.md`, `docs/adr/0003-padrao-de-notificacoes-toast.md` |
| UI / estilos / tema | `docs/adr/0007-css-modules-e-design-tokens.md`, `src/styles/tokens.css`, `docs/src/pages/_document.md`, `docs/src/pages/_app.md` |
| Botões / ações | `docs/adr/0010-sistema-de-botoes-com-variantes.md`, `docs/src/components/common/Button.md` |

## Regras para o agente

1. **Estado do projeto.** Leia `PROJECT_STATUS.md` (raiz) antes de trabalhar; ele registra o estado atual, pendentes e futuras (sem histórico).
2. **Documentação primeiro.** Consulte `docs/` antes do código. Se precisou ler o código, atualize o doc correspondente em `docs/` (e o índice `docs/README.md` se for doc novo).
3. **Documentar mudanças.** Ao concluir modificações de código, atualize `PROJECT_STATUS.md` e o doc afetado em `docs/` (e `docs/CONTEXT.md` se o contexto geral mudar). Siga `docs/documentation-guidelines.md` (padrão de documentação inclusive para ADRs).
4. **Next.js novo.** Esta versão do Next tem breaking changes. Cheque `node_modules/next/dist/docs/` quando for escrever código (ver `AGENTS.md`).
5. **Timezones.** Datas são tratadas em `America/Recife`.
6. **Validação.** Validação de campos em `src/utils/validation.ts` no contrato `{ ok, message }` (ADR 0002); parsing em `number.ts`/`date.ts`; regras de negócio fora da validação (ex.: `edit.ts`).
7. **Backups.** Ao alterar estrutura de um banco, revise os endpoints de backup correspondentes.
8. **Sem `any`/DOM direto.** Prefira tipagem forte e `refs` a `document.querySelector`. Em estilos novos, use CSS Modules + tokens e valide com `npm run lint:css`, `npm run styles:check` e `npm run check:css`.
9. **Conflito com as regras.** Se uma mudança solicitada violar regras de arquitetura/projeto/negócios/framework/boas práticas, pergunte explicitamente, explique o problema e proponha alternativa antes de implementar (ver `AGENTS.md`).
10. **Sem código criado via PowerShell.** Nunca gravar arquivos do projeto com cmdlets do PowerShell (`Set-Content`, `Out-File` etc.): gera mojibake (acentos de palavras como `mês` virando dois caracteres lixo) que passa em lint/typecheck/build e só estraga na tela. Use as ferramentas de edição de arquivo (UTF-8) e rode `node scripts/check-encoding.mjs` (com `--fix` para reparar) após criar/editar; ver `PROJECT_STATUS.md`, seção "Gravação de arquivos: nunca usar PowerShell". Comandos de execução (`npm`, `node`, `git`) no terminal são permitidos.

## Como manter este guia

Ao criar documentação nova, atualize `docs/README.md` (índice) e, se relevante, a tabela "Tema → Documentos" acima.