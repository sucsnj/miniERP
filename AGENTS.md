# AGENTS.md — Sistema de Gestão de Vendas

## Regra de ouro: documentação antes de código

Este projeto tem documentação estruturada em `docs/`. **Não releia código sem necessidade** — o contexto do projeto é carregado a partir da documentação:

1. Antes de qualquer tarefa, rode o comando **`/context`** no opencode (ou leia `docs/CONTEXT.md`, `docs/README.md` e `docs/DOCS.md`).
2. Use `docs/README.md` como índice central; a documentação de código espelha `src/` em `docs/src/` (mesmos caminhos e nomes; `docs/src/pages`, `docs/src/pages/api`, `docs/src/services`, `docs/src/database`, `docs/src/components`, `docs/src/hooks`, `docs/src/utils`, `docs/src/types`). Template único e regra de espelho em `docs/documentation-guidelines.md`; valide com `node scripts/check-docs.mjs`.
3. Se a documentação estiver incompleta ou desatualizada: leia o código com moderação e **atualize o documento correspondente** em `docs/`.
4. Ao criar um arquivo novo em `src/`, garanta o doc correspondente em `docs/` e inclua-o no índice `docs/README.md`.

## Regras para os agentes

### Documentação (obrigatória)

0. **Mudança significativa exige documentação** — siga `docs/documentation-guidelines.md`. Ao concluir qualquer modificação relevante de código/regra:
   - atualize `PROJECT_STATUS.md` (seções "Últimas mudanças", "Pendentes" e "Futuras", e a data no topo);
   - atualize o documento correspondente em `docs/` (e o índice `docs/README.md` se houver doc novo);
   - atualize `docs/CONTEXT.md` se o contexto geral mudar (novas regras, camadas, bancos, páginas);
   - crie **ADR** em `docs/adr/` quando a mudança criar/alterar um padrão de arquitetura (impacta mais de uma camada).
   - "mudança significativa" inclui: arquivo novo em `src/`, alteração de assinatura/comportamento, regra de negócio, padrão novo e correção de bug com impacto de UX.

### Melhorias e questionamento

- Ao encontrar algo que **possa melhorar** (código, docs, arquitetura, convenção) — mesmo que pareça intencional do projeto — **comunique e questione** o usuário antes de aplicar fora do escopo solicitado: explique o problema, o impacto e proponha alternativa.

### Estado do projeto (`PROJECT_STATUS.md`)

1. Antes de começar qualquer tarefa, leia `PROJECT_STATUS.md` (estado atual, últimas mudanças, pendentes e futuras) junto com `/context`.

### Framework e boas práticas

2. Siga as regras do framework: esta versão do Next.js tem breaking changes — leia `node_modules/next/dist/docs/` antes de escrever código e atente a avisos de depreciação.
3. Siga as boas práticas do projeto: TypeScript forte (sem `any`), validação centralizada em `src/utils/validation.ts`, datas em `America/Recife`, `refs` em vez de `document.querySelector`, e revisão dos endpoints de backup ao alterar estrutura de banco.
4. **Nomenclatura de código (ADR 0004)**: identificadores, funções e nomes de arquivo em **inglês**; pt-BR apenas em strings visíveis ao usuário. Código novo/refatorado nasce em inglês; identificadores pt-BR restantes são renomeados ao tocar nos módulos (sem renames massivos fora de contexto).
5. **Sem código criado via PowerShell**: nunca gravar/gerar arquivos do projeto com cmdlets do PowerShell (`Set-Content`, `Out-File`, `Add-Content`, herestrings do shell etc.) — a codificação padrão do Windows gera mojibake (acentos de palavras como `mês` virando dois caracteres lixo) que passa em lint/typecheck/build e só estraga na tela. Use sempre as ferramentas de edição de arquivo (gravação UTF-8) e, após criar/editar, rode `node scripts/check-encoding.mjs` (ver `PROJECT_STATUS.md`, seção "Gravação de arquivos"). Comandos de execução (`npm`, `node`, `git`) no terminal continuam permitidos.
6. **Estilos (ADR 0007)**: CSS novo em `*.module.css` com tokens de `src/styles/tokens.css`; não criar `styled-jsx` novo. Ao adicionar/remover classes, rode `npm run styles:types`, `npm run styles:check`, `npm run check:css` e `npm run lint:css`.

### Conflito com as regras

7. Se uma mudança solicitada violar regras de **arquitetura, projeto, negócios, framework ou boas práticas**, pergunte explicitamente antes de implementar: explique o problema, o impacto e proponha uma alternativa viável.

## Contexto rápido

- Stack: Next.js 16 + React 19 + TypeScript + MUI + React Query; persistência local SQLite (`better-sqlite3`, bancos em `db/`).
- Páginas em `src/pages/`, API interna em `src/pages/api/`, UI em `src/components/`, cliente HTTP em `src/services/`, persistência em `src/database/`, hooks em `src/hooks/`, utilitários em `src/utils/`, tipos em `src/types/`.
- Bancos: `vendas.db` (vendas), `contas.db`, `notas.db`, `tabela.db`, `produtos.db` (todos em `db/`).
- Timezone padrão de datas: `America/Recife`.

## Comandos úteis

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` — build de produção.
- `npm run lint` — lint (eslint).
- `npm run lint:css` — lint de CSS (stylelint; ignora `legacy.css` durante a migração).
- `npm run styles:types` — regenera a tipagem dos CSS Modules (`*.d.css.ts`).
- `npm run styles:check` — falha se a tipagem gerada estiver defasada.
- `npm run check:css` — falha se um componente usar classe ausente no CSS Module.
- `node scripts/check-encoding.mjs` — checa mojibake/BOM (use `--fix` para reparar); rodar antes de commitar. Nunca gravar arquivos com cmdlets do PowerShell (ver `PROJECT_STATUS.md`, seção "Gravação de arquivos").
- `node scripts/check-docs.mjs` — valida o espelho `docs/src` ↔ `src` (um `.md` por arquivo-fonte) e os links internos; rodar antes de commitar.
- `/context` — carrega o contexto do projeto a partir da documentação.
- `/skill fritar` — invoca a skill `grill-with-docs` (entrevista de design + ADRs).
- `/skill ensinar` — invoca a skill `teach` (aprendizado em workspace guiado).

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->