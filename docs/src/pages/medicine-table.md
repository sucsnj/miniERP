# `src/pages/medicine-table.tsx`

> Tabela de Medicamentos (`/medicine-table`): UF de referência, upload, busca e histórico no IndexedDB.

## O que faz

- Dropdown "UF de referência" (somente PE) é escolhido antes do upload; a seleção fica em cache e os cabeçalhos PF/PMC da tabela acompanham a UF.
- Upload XLS/XLSX no cliente: detecta a aba com a estrutura CMED (pt-BR), ignora as outras e grava o snapshot normalizado.
- Busca local com scoring; consultas repetidas vêm do histórico (60 itens / 30 dias, `source: 'history'`).
- Escape limpa o input; somente admins enviam planilha e limpam histórico.

## Relações

- **Usa:** `useMedicineTable`, `medicineTableStore`, `medicineTableSearch`, utils `shortcuts`, `date`, `src/styles/medicine-table.module.css`.
- **Usado por:** rota `/medicine-table`.

## Notas

- A UI diz "Últimas 100 buscas", mas o cache guarda 60 (mesmo padrão do OCR).
- Trocar a UF recalcula os preços do snapshot em cache; snapshots antigos exigem reenvio da planilha.
- Limpar dados do site exige enviar a planilha novamente.
