# `src/pages/medicine-table.tsx`

> Tabela de Medicamentos (`/medicine-table`): UF de referência, upload, busca e histórico no IndexedDB.

## O que faz

- Dropdown "UF de referência" (somente PE) é escolhido antes do upload; a seleção fica em cache e os cabeçalhos PF/PMC da tabela acompanham a UF.
- Upload XLS/XLSX no cliente: detecta a aba com a estrutura CMED (pt-BR), ignora as outras e grava o snapshot normalizado.
- Busca local com scoring; consultas repetidas vêm do histórico (20 itens / 30 dias, `source: 'history'`).
- Resultados com cabeçalho das colunas fixo abaixo da navbar (`top: var(--nav-height)`) e sem quebra de palavras (`white-space: nowrap`); células do corpo podem quebrar.
- Escape limpa o input; somente admins enviam planilha e limpam histórico.

## Relações

- **Usa:** `useMedicineTable`, `medicineTableStore`, `medicineTableSearch`, utils `shortcuts`, `date`, `src/styles/medicine-table.module.css`.
- **Usado por:** rota `/medicine-table`.

## Notas

- O sticky depende de `overflow-x: clip` em `html, body` (`base.css`/`globals.css`): `hidden` criava scroll container e impedia o cabeçalho de colar.
- O painel informa "Últimas 20 buscas"; o cache mantém 20 itens/30 dias e o botão "Limpar histórico" tem largura de conteúdo.
- Trocar a UF recalcula os preços do snapshot em cache; snapshots antigos exigem reenvio da planilha.
- Limpar dados do site exige enviar a planilha novamente.
