# ADR 0007 — CSS Modules, design tokens e tema por `data-theme`

- **Status:** aceito e implementado em fases (23/10/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 23/10/2026.

## Contexto

Os estilos estavam concentrados em `globals.css` (~1.300 linhas), cinco CSS Modules com centenas de linhas cada e `styled-jsx` em 14 componentes. Havia classes globais sem definição, dependências entre estilos de componentes diferentes (ex.: `EditSaleForm` usando classes do `styled-jsx` de `DailySaleForm`), vazamentos globais (`body`/`html` alterados por módulos), CSS morto e dois mecanismos de tema (`html.light`/`html.dark` no CSS, classes aplicadas pelo `Nav`). A duplicação de modais e hooks também pressionava a camada de UI.

## Decisão

1. **CSS Modules como padrão de estilo por componente**, mantendo `styled-jsx` apenas durante a migração; nenhum componente novo usa `styled-jsx`.
2. **Design tokens em `src/styles/tokens.css`** (`:root`, `prefers-color-scheme` e `[data-theme]`) para cores, espaçamento, raios, tipografia, alturas e z-index.
3. **Tema único por `data-theme`**: `_document.tsx` aplica o valor salvo antes da hidratação; `Nav` alterna `system/light/dark` e remove o atributo no modo sistema. As classes `html.light`/`html.dark` e o esquema antigo foram removidos.
4. **CSS global dividido por responsabilidade**: `tokens.css`, `base.css` (reset/elementos), `utilities.css` (utilitários) e `legacy.css` (classes globais em migração). A ordem de import em `_app.tsx` é tokens → base → utilities → legacy.
5. **Validação de estilos**: `stylelint` (`npm run lint:css`), geração de tipos de CSS Modules com `typed-css-modules` em `*.d.css.ts` (`npm run styles:types` / `styles:check`) e `scripts/check-css-modules.mjs` (`npm run check:css`) para impedir `styles.classeInexistente`.
6. **Migração incremental**: Fase 0 corrige bugs e remove CSS morto; Fase 1 cria a fundação; fases seguintes consolidam primitivas, modais, hooks de catálogo e removem o restante de `styled-jsx`.

## Consequências

**Positivas:**

- Uma única fonte de verdade para o tema, sem flash e sem divergência entre claro/escuro.
- Classes inexistentes passam a falhar em verificação, não apenas na tela.
- Estilos de componente deixam de depender de `styled-jsx` de outro componente.
- Tokens reduzem valores mágicos e facilitam a evolução visual.

**Negativas / aceitas:**

- `legacy.css` ainda concentra estilos globais até a migração dos módulos grandes.
- Tipos de CSS Modules são gerados (`*.d.css.ts`) e precisam ser regenerados após mudanças de classes; `styles:check` detecta defasagem.
- A migração completa de `styled-jsx` e a consolidação das primeiras primitivas (`Button`, `Field`, `Dialog`, `Table`) foram concluídas na Fase 2; refinamentos visuais seguem incrementais.

## Alternativas consideradas

- **Continuar com `globals.css`:** rejeitado — acoplamento global e dificuldade de rastrear uso.
- **CSS-in-JS (Emotion/styled):** rejeitado — MUI/Emotion já existe apenas para ícones/Tooltip; adotar CSS-in-JS ampliaria dependências e runtime.
- **Tailwind:** rejeitado — exigiria reescrever toda a UI e não resolve a organização atual de módulos.
- **Manter tema por classes:** rejeitado — dois caminhos de tema e CSS duplicado para claro/escuro.

## Referências

- `src/styles/tokens.css`, `base.css`, `utilities.css`, `legacy.css`.
- `src/pages/_document.tsx`, `src/pages/_app.tsx`, `src/components/common/Nav.tsx`.
- `stylelint.config.mjs`, `scripts/check-css-modules.mjs`.
- `PROJECT_STATUS.md` (fases da refatoração de UI).
