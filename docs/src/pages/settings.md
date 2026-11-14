# `src/pages/settings.tsx`

> Página dedicada de configurações do aplicativo.

## O que faz

- Exibe o padrão da empresa (`company_settings`) e overrides locais por dispositivo.
- Cards usam layout masonry (colunas com altura independente, primitivas compartilhadas em `src/utils/layout.ts`).
- Admin altera tema, fuso horário, histórico recente, foco automático/delay, auto consolidação, ampliação dos campos e PIX da empresa.
- Ampliação dos campos é compartilhada por empresa (sem override local): Data, Valor e Observações podem ser ajustados individualmente em `1.2x`, `1.5x`, `2x` ou `2.5x`.
- Merchant visualiza os padrões da empresa e pode usar overrides locais (tema, fuso, recentes, foco/delay).
- Auto consolidação é um padrão compartilhado da empresa: ativa/desativa, escolhe o dia (1–28) do mês seguinte e o escopo (`all-previous` padrão: todos os meses anteriores com vendas, ou `previous-month`: somente o mês anterior).
- PIX da empresa é compartilhado, editável apenas por admin; merchant pode gerar QR, mas não alterar dados PIX.
- Ao salvar um formulário PIX completo, a página guarda/atualiza um preset compartilhado (`pix_presets`) por endpoint atômico, sem sobrescrever presets de outro admin.
- "Preenchimento rápido" usa um dropdown; ao lado dele há lixeira para excluir o preset selecionado. O preset selecionado é apenas preenchido no formulário e o PIX atual só muda ao clicar em Salvar PIX.
- Na lista de presets, exibe apelido + chave; quando não há apelido, mostra apenas a chave.
- Ao recarregar `/settings`, se o PIX vigente coincidir com um preset, a seleção e o campo "Apelido do preset" são restaurados; se não coincidir, o campo fica vazio.
- Cada preset tem botão de lixeira para excluí-lo compartilhadamente da empresa.
- "Limpar dados PIX" zera o PIX vigente e os campos do formulário explicitamente (inclui autofill do browser via `autoComplete="off"`), sem apagar presets.

## Relações

- **Usa:** `src/contexts/SettingsContext.tsx`, `src/services/settingsService.ts`, `src/contexts/ThemeContext.tsx`, `src/contexts/AuthContext.tsx`, componentes comuns de layout.
- **Acessada por:** link de configurações na [Nav](../components/common/Nav.md).

## Notas

- Novas funções de configuração serão adicionadas gradualmente nesta página.
