# Documentação do Projeto Vendas

> Contexto rápido para agentes: ver `CONTEXT.md`. Índice completo: `README.md`.

## Arquitetura Geral

O projeto é uma aplicação Next.js 16 com front-end React e back-end API routes integrados via `src/pages/api`. A arquitetura segue uma separação simples:

- `src/pages`: páginas de rota Next.js que orquestram componentes e estados.
- `src/components`: componentes visuais reutilizáveis e painéis de UI.
- `src/hooks`: hooks de estado (carrinho, filtros, toasts e CRUD de catálogo).
- `src/services`: camada cliente que faz chamadas `fetch` para APIs internas.
- `src/pages/api`: endpoints REST internos que expõem operações CRUD.
- `src/database`: abstração local SQLite usando `better-sqlite3` para persistência.
- `src/utils`: funções utilitárias de formatação, parsing e limpeza.
- `src/types`: tipos compartilhados entre camadas.

## Fluxo de Dados

1. A navegação em `src/pages/_app.tsx` envolve as páginas com `React Query` e exibe a `Nav` global.
2. Páginas como `index.tsx`, `produtos.tsx`, `cadastro.tsx`, `contas-a-pagar.tsx`, `historico.tsx` e `resumo.tsx` consomem serviços em `src/services`.
3. Os serviços fazem `fetch` para endpoints sob `src/pages/api`.
4. Os endpoints usam `src/database` para ler e gravar em bancos SQLite locais.
5. Componentes exibem formulários, tabelas, gráficos e toasts com retornos das chamadas.

## Dependências Externas Críticas

- `next`, `react`, `react-dom`: base do app.
- `@tanstack/react-query`: cache de dados e refetch automático.
- `better-sqlite3`: persistência local SQLite no servidor.
- `multer`: upload de arquivos para endpoints de OCR e tabela.
- `pdf2pic`, `sharp`, `tesseract.js`: pipeline de OCR / conversão de PDF.
- `xlsx`: leitura e escrita de planilhas.
- `recharts`: exibição de gráficos.

## Pontos Fortes

- Separação clara entre UI, serviços e banco.
- Uso consistente de componentes React funcionais.
- Suporte a importação/exportação XLSX, PDF, backup e OCR.
- Estrutura de dados simples e fácil de entender para vendas e contas.

## Pontos Fracos e Riscos

- Lógica de upload e parse de XML está acoplada no endpoint `src/pages/api/contas/import.ts`.
- Validação de entrada é limitada no frontend e no backend para alguns campos.
- Uso de banco local SQLite assume execução em ambiente Node com permissão a arquivos.
- `localStorage` e manipulação de DOM aparecem em páginas sem abstração.
- Alguns endpoints `GET /api/notas` retornam `allNotas` independentemente de query específica.

## Sugestões de Melhoria

- Extrair regras de validação para funções utilitárias reutilizáveis.
- Centralizar mensagens de erro e sucesso para consistência.
- Criar abstração de dados para tabelas e histórico em vez de misturar leitura direta de banco.
- Aplicar tipagem mais forte em retornos de fetch e dados de API.
- Evitar `any` e normalizar dados antes de salvar no banco.
- Adicionar testes automatizados para endpoints API e serviços.
- Mover lógica sensível de OCR/arquivo para um módulo dedicado com tratamento de erros mais robusto.
- Evitar `document.querySelector` direto no cliente e usar refs sempre que possível.

## Como Usar

- `npm run dev` para rodar em `localhost:3100`.
- Acesse `/` para dashboard de vendas.
- Acesse `/historico` para histórico de vendas.
- Acesse `/contas-a-pagar` para gestão de contas.
- Acesse `/tabela` para upload e busca em tabela de medicamentos.

## Estrutura de Pastas do Docs

- `docs/pages`: documentação por rota.
- `docs/services`: detalhes das camadas de serviço.
- `docs/database`: descrição das camadas de dados.
- `docs/components`: explicação dos componentes principais.
- `docs/hooks` e `docs/types`: hooks de estado e tipos compartilhados.
- `docs/utils`: utilitários e funções de apoio.
