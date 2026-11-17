# `src/pages/medicine-table.tsx`

> Tabela de Medicamentos (`/medicine-table`): upload de planilha, busca local e histórico no IndexedDB.

## O que faz

- Não faz nenhuma requisição para buscar/status/histórico; o snapshot é carregado do IndexedDB no mount.
- Faz upload XLS/XLSX no cliente, normaliza colunas/valores, grava no IndexedDB e limpa histórico antigo.
- Busca por termo com scoring local; consultas já feitas ficam em histórico local (60 itens / 30 dias) para retorno instantâneo (`source: 'history'`).
- Escape limpa o input de busca.
- Sem persistência no Supabase; cada dispositivo/navegador possui seu próprio snapshot.

## Relações

- **Usa:** `useMedicineTable`, `medicineTableStore`, `medicineTableSearch`, utils `shortcuts`, `date`, `src/styles/medicine-table.module.css`.
- **Usado por:** rota `/medicine-table`.

## Notas

- A UI diz "Últimas 100 buscas", mas o armazenamento limita a 60 itens (mesmo padrão do OCR). Corrigir o texto para 60 se necessário.
- Após limpar dados do site, é preciso enviar a planilha novamente.
