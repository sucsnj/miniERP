# `src/contexts/SettingsContext.tsx`

> Contexto global de preferências do aplicativo.

## O que faz

- Mantém a quantidade de vendas recentes exibidas no histórico (`0`, `2`, `4`, `6` ou `8`).
- Mantém o fuso horário do aplicativo (padrão `America/Recife`).
- Mantém a opção de foco automático no campo de venda (`autoFocusSaleInput`, padrão `true`).
- Mantém o delay do foco automático, em segundos (`autoFocusSaleInputDelay`, padrão `60`, mínimo `5`).
- Mantém os dados PIX (`pixKey`, `pixName`, `pixBank`, `pixCity`), persistidos em `localStorage`.
- Expõe `clearPixData` para limpar os campos PIX e remover os valores do `localStorage`.
- Persiste as escolhas em `localStorage` e cookie `timezone`.
- Fornece valor padrão `4`.

## Relações

- **Usado por:** [index](../pages/index.md), [settings](../pages/settings.md).

## Notas

- Estado inicial consistente (`4`) para evitar mismatch de hidratação; leitura do `localStorage` ocorre em efeito.
