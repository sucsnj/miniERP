# PROJECT_STATUS.md — Estado atual do projeto

> Fonte da verdade sobre o **estado atual** e o que está **pendente/futuro**. Não registra histórico: decisões e mudanças passadas ficam em `docs/` (ADRs e docs de código) e no histórico do Git. Todo agente deve ler antes de trabalhar e atualizar ao final de cada mudança.

Atualizado em: **12/11/2026**

## Resumo executivo

Sistema de gestão de vendas (Next.js 16 + React 19 + TypeScript + MUI + React Query). Persistência 100% Supabase; SQLite/better-sqlite3/backups removidos. OCR mantido desativado para evolução futura. Offline/PWA planejado para depois.

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
| Persistência | Supabase |
| Offline/PWA | não implementado |
| Teste manual | funcionalidades críticas validadas; fluxo Supabase/auth e deploy ainda não exercitados em runtime |

## Pendentes

- **Fase 5 / deploy:** publicar na Vercel, configurar variáveis de ambiente, validar upload XLSX (`/tmp` ou Storage) e exercitar o fluxo completo em runtime.
- **Auth/multiempresa/multi-loja:** validação runtime completa antes do rollout definitivo.
- **Banco do navbar / PIX / auto consolidação:** aplicar `supabase/migrations/0016-add-user-avatar-url.sql`, `supabase/migrations/0017-add-pix-presets-to-company-settings.sql` e `supabase/migrations/0018-add-auto-consolidation-settings.sql`.

## Futuras / Melhorias sugeridas

- **Offline/PWA:** funcionamento offline com cache em `localStorage` + IndexedDB e app instalável. Decisões de arquitetura e sincronização ficam para um ADR próprio quando a fase começar.
- **Melhorias recomendadas (P2/P3 do `DOCS.md`):** abstração de dados de tabela/histórico; tipagem forte de `fetch`; extrair XML de `contas/import.ts`; testes automatizados; validação transversal de tamanho máximo de strings.
- **Qualidade:** validação manual adicional em `npm run dev` para cenários não cobertos pelo teste crítico; revisão da formatação de exportação (`jspdf`/`xlsx`); remoção futura de classes CSS legadas não referenciadas.
- **Manutenção:** manter docs e este arquivo alinhados a qualquer evolução de API ou regra.

## Como manter este arquivo

- Registre apenas **estado atual**, **pendentes** e **futuro**; não adicione seções de histórico.
- Mudanças e decisões passadas pertencem aos docs (`docs/`, ADRs) e ao histórico do Git.
- Atualize a data no topo a cada revisão.
- Atualize também o doc correspondente em `docs/` (e `docs/README.md`/`CONTEXT.md` se necessário) antes de encerrar a tarefa.
