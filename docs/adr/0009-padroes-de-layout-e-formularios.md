# ADR 0009 — Padrão de layout e formulários baseado em `/contas-a-pagar`

- **Status:** aceito (25/10/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 25/10/2026.

## Contexto

As páginas tinham estruturas visuais diferentes (padding, grids, painéis, cabeçalhos, chips e formulários). A página `/contas-a-pagar` já concentrava o padrão mais completo e consistente do sistema, com `contasPage`, `contasGrid`, `contasPanel`, `panelHeader`, `statusChip`, `formRow` e `formActions`.

## Decisão

1. **Criar primitivas de layout reutilizáveis** em `src/components/common/`: `PageShell`, `PageHeader`, `PageGrid`, `Panel`, `PanelHeader`, `StatusChip`, `Form`, `FormRow`, `FormActions` e `FormField`.
2. **Centralizar os estilos em `src/styles/layout.module.css`**, derivados do layout de `/contas-a-pagar`, com responsividade equivalente.
3. **Não alterar páginas existentes nesta rodada**; o padrão fica disponível para adoção gradual.
4. **Documentar o padrão** em `docs/adr/0009-padroes-de-layout-e-formularios.md` e nos docs dos componentes.

## Consequências

**Positivas:**

- Uma única referência visual para novas páginas e refatorações futuras.
- Menos duplicação de classes globais e estilos inline.
- Formulários e painéis passam a compartilhar estrutura acessível e responsiva.

**Negativas / aceitas:**

- Páginas antigas continuam usando seus estilos atuais até migração futura.
- O padrão pode precisar de ajustes conforme outros domínios forem migrados.

## Referências

- `src/styles/layout.module.css`
- `src/components/common/PageShell.tsx`
- `src/components/common/PageHeader.tsx`
- `src/components/common/PageGrid.tsx`
- `src/components/common/Panel.tsx`
- `src/components/common/PanelHeader.tsx`
- `src/components/common/StatusChip.tsx`
- `src/components/common/Form.tsx`
- `src/components/common/FormRow.tsx`
- `src/components/common/FormActions.tsx`
- `src/components/common/FormField.tsx`
- `src/pages/contas-a-pagar.tsx`
- `src/styles/contas.module.css`
