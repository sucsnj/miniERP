# PROJECT_STATUS.md — Estado atual do projeto

> Fonte da verdade sobre o **estado atual** e o que está **pendente/futuro**. Não registra histórico: decisões e mudanças passadas ficam em `docs/` (ADRs e docs de código) e no histórico do Git. Todo agente deve ler antes de trabalhar e atualizar ao final de cada mudança.

Atualizado em: **11/11/2026**

## Resumo executivo

Sistema de gestão de vendas (Next.js 16 + React 19 + TypeScript + MUI + React Query). Estágio atual: **estável**, Fases 0 a 4 concluídas (ADR 0012). Persistência 100% Supabase; SQLite/better-sqlite3/backups removidos. OCR mantido desativado para evolução futura. Offline/PWA planejado para depois.

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
| Persistência | Supabase (todo o domínio migrado) |
| Supabase | schema aplicado; repositórios e rotas migradas em uso |
| Offline/PWA | não implementado (futuro) |
| Teste manual | funcionalidades críticas OK; fluxo Supabase ainda não exercitado em runtime |

## Pendentes

- **Migração Supabase (ADR 0012) — Fases 0 a 4:** concluídas.
- **Fase 5:** Vercel (variáveis de ambiente, upload XLSX em `/tmp` ou Storage) e validação do deploy; autenticação/proteção será feita no plano ADR 0013.
- **Autenticação e multiempresa/multi-loja (ADR 0013):** fases 0–9 concluídas; auth/multitenancy validado por build/lint/testes estáticos; PDF de exportação removido completamente. Rollout/deploy e validação runtime completa permanecem pendentes.
- **TanStack Query (`local-first`):** Fases 1–4 concluídas (defaults canônicos, `tenantKeys`, `/` e `/payables` em `useQuery`/`useMutation`, optimistic updates, invalidação granular, prefetch explícito e navegação instantânea).
- **Navbar:** redesenhada com menu do usuário (`avatar_url` ou inicial), sempre visível, alto contraste/compacta e seletor de loja + ações à direita. Banco: aplicar `supabase/migrations/0016-add-user-avatar-url.sql`.
- **Refatoração de grandes componentes:** CartModal, ImportItemsModal, SelectItemsModal já estão apresentacionais; ProductForm foi dividido em ProductPriceSection e ProductUnitsSection.

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
