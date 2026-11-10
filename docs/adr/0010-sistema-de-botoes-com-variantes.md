# ADR 0010 — Sistema de botões com variantes funcionais

- **Status:** aceito (26/10/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 26/10/2026.

## Contexto

O projeto possuía dezenas de botões nativos com classes globais e módulos diferentes, gerando variações de cor, tamanho, foco, ícone e responsividade. O `Button` compartilhado existia, mas com aparência única e sem contrato para ações destrutivas, confirmação, carregamento e botões somente de ícone.

## Decisão

1. **Adotar `Button` como única primitiva de ação** para botões visuais do sistema.
2. **Variantes funcionais:** `primary`, `success`, `danger`, `warning`, `info`, `secondary`, `outline` e `ghost`, baseadas nos tokens de `src/styles/tokens.css`.
3. **Tamanhos:** `sm`, `md` (padrão) e `lg`.
4. **API:** `leftIcon`, `rightIcon`, `isLoading` e `iconOnly`; `icon` fica como alias legado temporário de `leftIcon`.
5. **Acessibilidade:** `isLoading` aplica `disabled` e `aria-busy`; `iconOnly` mantém `children` como rótulo visualmente oculto, além de aceitar `aria-label`.
6. **Migração gradual:** substituir os botões legados por fases, começando por primitivas compartilhadas e pelo endpoint principal, sem alterar todos os módulos de uma vez.
7. **Limpeza posterior:** remover classes globais e de módulos somente depois que não houver mais referências.

## Consequências

**Positivas:**

- Ações passam a ter semântica visual consistente em todo o sistema.
- Menos CSS duplicado e menos variações de foco, hover e desabilitado.
- Botões somente de ícone ganham dimensões e rótulo acessível padronizados.

**Negativas / aceitas:**

- A migração exige revisão manual de cada tela e teste de regressão visual.
- Durante a transição, classes antigas e novas coexistirão.
- O alias `icon` precisa ser removido em uma fase posterior.

## Alternativas consideradas

- Manter o botão de aparência única: não cobre ações destrutivas, confirmação e ícones.
- Criar um botão por domínio: repetiria estilos e decisões de acessibilidade.
- Migrar todos os botões de uma vez: risco alto e difícil de revisar.

## Referências

- `src/components/common/Button.tsx`
- `src/styles/button.module.css`
- `src/styles/tokens.css`
- `docs/src/components/common/Button.md`
- `docs/adr/0007-css-modules-e-design-tokens.md`
- `docs/adr/0009-padroes-de-layout-e-formularios.md`
