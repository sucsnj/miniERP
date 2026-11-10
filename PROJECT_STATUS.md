# PROJECT_STATUS.md — Estado atual do projeto

> Fonte da verdade sobre o **estado atual** e o que está **pendente/futuro**. Não registra histórico: decisões e mudanças passadas ficam em `docs/` (ADRs e docs de código) e no histórico do Git. Todo agente deve ler antes de trabalhar e atualizar ao final de cada mudança.

Atualizado em: **09/11/2026**

## Resumo executivo

Sistema de gestão de vendas (Next.js 16 + React 19 + TypeScript + MUI + React Query). Estágio atual: **estável**, com a migração SQLite → Supabase em andamento. Fases 0 a 2 concluídas (ADR 0012, schema aplicado no Dashboard e client server-only + validação de env). O SQLite continua sendo a persistência ativa até a Fase 3. Offline/PWA está planejado para depois da migração.

## Estado atual

| Item | Situação |
| --- | --- |
| `npm run lint` | limpo (zero problemas) |
| `npm run lint:css` | limpo (zero problemas) |
| `npm run check:css` | nenhuma classe ausente |
| `npm run styles:check` | tipagem de CSS Modules em dia |
| `npx tsc --noEmit` | zero erros |
| `npm run build` | build de produção OK |
| `node scripts/check-docs.mjs` | espelho e links consistentes |
| `node scripts/check-encoding.mjs` | sem mojibake/BOM |
| Persistência | SQLite ativo (`vendas.db`, `contas.db`, `notas.db`, `tabela.db`, `produtos.db`) |
| Supabase | schema aplicado; `src/database/supabase.ts` e `src/utils/env.ts` prontos; nenhuma rota usa o Supabase ainda |
| Offline/PWA | não implementado (futuro) |
| Teste manual | funcionalidades críticas OK; fluxo Supabase ainda não exercitado em runtime |

## Pendentes

- **Migração Supabase (ADR 0012) — Fase 3:** migrar um domínio por vez, com pausa entre eles: vendas/estoque → catálogo → contas/notas → tabela de medicamentos → consolidação mensal. Cada etapa inclui repository, API, service e frontend renomeados para inglês.
- **Fase 4:** remover SQLite (`db/`, `better-sqlite3`), endpoints/botões de backup e OCR/PDF; atualizar docs espelhados.
- **Fase 5:** Vercel (variáveis de ambiente, upload XLSX em `/tmp` ou Storage) e validação do deploy; autenticação/proteção ficam para depois.
- **Refatoração de grandes componentes:** `CartModal`, `ImportItemsModal`, `ProductForm` e `SelectItemsModal` — extrair hooks/serviços/subcomponentes no padrão do `DailySaleForm`.

## Futuras / Melhorias sugeridas

- **Offline/PWA (pós-migração):** funcionamento offline com cache em `localStorage` + IndexedDB e app instalável como PWA (manifest, service worker e sincronização). Decisões de arquitetura e conflitos de sincronização ficam para um ADR próprio quando a fase começar.
- **Melhorias recomendadas (P2/P3 do `DOCS.md`):** abstração de dados de tabela/histórico; tipagem forte de `fetch`; extrair XML de `contas/import.ts`; testes automatizados; validação transversal de tamanho máximo de strings.
- **Qualidade:** validação manual adicional em `npm run dev` para cenários não cobertos pelo teste crítico; revisão da formatação de exportação (`jspdf`/`xlsx`); remoção futura de classes CSS legadas não referenciadas.
- **Manutenção:** manter docs e este arquivo alinhados a qualquer evolução de API ou regra.

## Como manter este arquivo

- Registre apenas **estado atual**, **pendentes** e **futuro**; não adicione seções de histórico.
- Mudanças e decisões passadas pertencem aos docs (`docs/`, ADRs) e ao histórico do Git.
- Atualize a data no topo a cada revisão.
- Atualize também o doc correspondente em `docs/` (e `docs/README.md`/`CONTEXT.md` se necessário) antes de encerrar a tarefa.
