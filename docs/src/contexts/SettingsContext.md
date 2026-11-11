# `src/contexts/SettingsContext.tsx`

> Contexto global de preferências do aplicativo.

## O que faz

- Mantém a quantidade de vendas recentes exibidas no histórico (`0`, `2`, `4`, `6` ou `8`).
- Persiste a escolha em `localStorage['recentSalesCount']`.
- Fornece valor padrão `4`.

## Relações

- **Usado por:** [index](../pages/index.md), [settings](../pages/settings.md).

## Notas

- Estado inicial consistente (`4`) para evitar mismatch de hidratação; leitura do `localStorage` ocorre em efeito.
