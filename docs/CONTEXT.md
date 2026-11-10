# Contexto Rápido para Agentes

> Este documento existe para que o agente entenda o projeto sem reler o código. Complementa `docs/README.md` (índice completo) e `docs/DOCS.md` (arquitetura). O estado atual do projeto (últimas mudanças, pendentes e futuras) fica em `PROJECT_STATUS.md` (raiz).

## O que é este projeto

Sistema de gestão de vendas (Next.js 16 + React 19 + TypeScript). Aplicação single-app: frontend e API interna rodam no mesmo processo; tudo persiste em bancos SQLite locais no servidor. Não há autenticação externa nem banco remoto.

## Pilha principal

- **Next.js 16** — páginas em `src/pages/` e API interna em `src/pages/api/`.
- **React 19** + **MUI** (`@mui/material`, `@emotion`) para UI.
- **@tanstack/react-query** — cache/estado de servidor no cliente.
- **better-sqlite3** — persistência local (bancos em `db/`).
- **dayjs** — datas (timezone padrão `America/Recife`).
- **recharts** — gráficos; **jspdf/html2canvas** — PDF; **xlsx** — planilhas.
- **multer + pdf2pic + sharp + tesseract.js** — upload e OCR de notas.

## Camadas (onde mora cada coisa)

- `src/pages/*.tsx` — rotas/páginas que orquestram tudo.
- `src/components/*.tsx` — UI: formulários, tabelas, modais, gráficos, navegação.
- `src/hooks/*.ts` — hooks de estado: carrinho, filtros, toasts, CRUD de catálogo.
- `src/services/*.ts` — cliente `fetch` para os endpoints internos.
- `src/pages/api/**/*.ts` — endpoints REST internos.
- `src/database/*.ts` — abstrações `better-sqlite3` (vendas, contas, notas, tabela, produtos).
- `src/utils/*.ts(x)` — formatação, validação, datas, números, cores.
- `src/types/*.ts` — tipos compartilhados.

## Bancos de dados

Bancos em `db/` (SQLite). Documentação em `docs/database/`.

- `vendas.db` — vendas diárias, itens de venda e consolidação mensal.
- `contas.db` — contas a pagar.
- `notas.db` — notas fiscais importadas.
- `tabela.db` — tabelas de medicamentos importadas.
- `produtos.db` — catálogo: produtos, serviços, categorias, marcas, fornecedores, unidades de medida e movimentações de estoque.

## Páginas principais

- `/` — dashboard de vendas do mês: formulário, gráfico, totais, edição e backup.
- `/historico` — histórico e busca de vendas passadas.
- `/resumo` — consolidação mensal e totais.
- `/contas-a-pagar` — gestão e importação de contas a pagar.
- `/tabela` — upload e consulta da tabela de medicamentos.
- `/produtos` — catálogo, estoque, preços e movimentações.
- `/cadastro` — cadastros auxiliares (categorias, marcas, fornecedores, unidades de medida, etc.).

## Tema → Documentos para ler

| Se você vai mexer em... | Leia primeiro |
| --- | --- |
| Alinhamento / domínio / refatoração | `docs/ALIGNMENT.md` (domínio, usuários, fluxos, pontos de atenção) |
| Arquitetura geral / fluxo de dados | `docs/DOCS.md` |
| Dashboard / vendas do dia | `docs/pages/index.md`, `docs/pages/api/vendas.md`, `docs/pages/api/venda-itens.md`, `docs/services/vendasService.md` |
| Histórico / relatórios | `docs/pages/historico.md`, `docs/pages/resumo.md`, `docs/pages/api/mensais.md` |
| Contas a pagar | `docs/pages/contas-a-pagar.md`, `docs/database/contasDb.md`, `docs/services/contasService.md`, `docs/pages/api/contas.md`, `docs/pages/api/contas-import.md`, `docs/pages/api/contas-backup.md` |
| Produtos / estoque | `docs/pages/produtos.md`, `docs/database/produtosDb.md`, `docs/pages/api/produtos*.md`, `docs/services/produtosService.md` |
| Cadastros auxiliares | `docs/pages/cadastro.md`, `docs/components/ModaisCadastro.md` |
| PIX / pagamento | `docs/components/Pix.md` |
| Carrinho de compras | `docs/components/ModalCarrinho.md`, `docs/hooks/Hooks.md` (useCart) |
| Formulários de venda (dia/item) | `docs/components/DailySaleForm.md`, `docs/components/FormularioItem.md`, `docs/components/EditSaleForm.md` |
| OCR / importação | `docs/pages/api/ocr.md`, `docs/services/ocrService.md`, `docs/services/pdfService.md`, `docs/components/OcrUpload.md` |
| Tabela de medicamentos | `docs/pages/tabela.md`, `docs/database/tabelaDb.md` |
| Notas fiscais | `docs/pages/api/notas.md`, `docs/database/notasDb.md` |
| Backup | `docs/pages/api/backup.md`, `docs/pages/api/contas-backup.md` |
| Componente/hook/util específico | procurar em `docs/components/`, `docs/hooks/`, `docs/utils/` |
| Validação de campos / formulários | `docs/adr/0002-padrao-de-validacao-de-campos.md`, `docs/utils/Utils.md` (`validation.ts`, `forms.tsx`) |

## Regras para o agente

1. **Estado do projeto.** Leia `PROJECT_STATUS.md` (raiz) antes de trabalhar; ele registra o estado atual, últimas mudanças, pendentes e futuras.
2. **Documentação primeiro.** Consulte `docs/` antes do código. Se precisou ler o código, atualize o doc correspondente em `docs/` (e o índice `docs/README.md` se for doc novo).
3. **Documentar mudanças.** Ao concluir modificações de código, atualize `PROJECT_STATUS.md` e o doc afetado em `docs/` (e `docs/CONTEXT.md` se o contexto geral mudar).
4. **Next.js novo.** Esta versão do Next tem breaking changes. Cheque `node_modules/next/dist/docs/` quando for escrever código (ver `AGENTS.md`).
5. **Timezones.** Datas são tratadas em `America/Recife`.
6. **Validação.** Validação de campos em `src/utils/validation.ts` no contrato `{ ok, message }` (ADR 0002); parsing em `number.ts`/`date.ts`; regras de negócio fora da validação (ex.: `edit.ts`).
7. **Backups.** Ao alterar estrutura de um banco, revise os endpoints de backup correspondentes.
8. **Sem `any`/DOM direto.** Prefira tipagem forte e `refs` a `document.querySelector`.
9. **Conflito com as regras.** Se uma mudança solicitada violar regras de arquitetura/projeto/negócios/framework/boas práticas, pergunte explicitamente, explique o problema e proponha alternativa antes de implementar (ver `AGENTS.md`).

## Como manter este guia

Ao criar documentação nova, atualize `docs/README.md` (índice) e, se relevante, a tabela "Tema → Documentos" acima.