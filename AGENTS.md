# AGENTS.md — Sistema de Gestão de Vendas

## Regra de ouro: documentação antes de código

Este projeto tem documentação estruturada em `docs/`. **Não releia código sem necessidade** — o contexto do projeto é carregado a partir da documentação:

1. Antes de qualquer tarefa, rode o comando **`/context`** no opencode (ou leia `docs/CONTEXT.md`, `docs/README.md` e `docs/DOCS.md`).
2. Use `docs/README.md` como índice central; cada camada tem docs próprios em `docs/pages`, `docs/pages/api`, `docs/services`, `docs/database`, `docs/components`, `docs/hooks`, `docs/utils` e `docs/types`.
3. Se a documentação estiver incompleta ou desatualizada: leia o código com moderação e **atualize o documento correspondente** em `docs/`.
4. Ao criar um arquivo novo em `src/`, garanta o doc correspondente em `docs/` e inclua-o no índice `docs/README.md`.

## Regras para os agentes

### Estado do projeto (`PROJECT_STATUS.md`)

1. Antes de começar qualquer tarefa, leia `PROJECT_STATUS.md` (estado atual, últimas mudanças, pendentes e futuras) junto com `/context`.
2. Ao concluir qualquer modificação de código, **documente o que foi feito**:
   - atualize `PROJECT_STATUS.md` (seções "Últimas mudanças", "Pendentes" e "Futuras", e a data no topo);
   - atualize o documento correspondente em `docs/` (e o índice `docs/README.md` se houver doc novo);
   - atualize `docs/CONTEXT.md` se o contexto geral mudar (novas regras, camadas, bancos, páginas).

### Framework e boas práticas

3. Siga as regras do framework: esta versão do Next.js tem breaking changes — leia `node_modules/next/dist/docs/` antes de escrever código e atente a avisos de depreciação.
4. Siga as boas práticas do projeto: TypeScript forte (sem `any`), validação centralizada em `src/utils/validation.ts`, datas em `America/Recife`, `refs` em vez de `document.querySelector`, e revisão dos endpoints de backup ao alterar estrutura de banco.

### Conflito com as regras

5. Se uma mudança solicitada violar regras de **arquitetura, projeto, negócios, framework ou boas práticas**, pergunte explicitamente antes de implementar: explique o problema, o impacto e proponha uma alternativa viável.

## Contexto rápido

- Stack: Next.js 16 + React 19 + TypeScript + MUI + React Query; persistência local SQLite (`better-sqlite3`, bancos em `db/`).
- Páginas em `src/pages/`, API interna em `src/pages/api/`, UI em `src/components/`, cliente HTTP em `src/services/`, persistência em `src/database/`, hooks em `src/hooks/`, utilitários em `src/utils/`, tipos em `src/types/`.
- Bancos: `vendas.db` (vendas), `contas.db`, `notas.db`, `tabela.db`, `produtos.db` (todos em `db/`).
- Timezone padrão de datas: `America/Recife`.

## Comandos úteis

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` — build de produção.
- `npm run lint` — lint (eslint).
- `/context` — carrega o contexto do projeto a partir da documentação.
- `/skill fritar` — invoca a skill `grill-with-docs` (entrevista de design + ADRs).
- `/skill ensinar` — invoca a skill `teach` (aprendizado em workspace guiado).

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->