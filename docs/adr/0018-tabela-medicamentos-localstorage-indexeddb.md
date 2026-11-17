# ADR 0018 — Tabela de medicamentos local-first em IndexedDB

- **Status:** aceita (substitui ADR 0017)

## Contexto

A persistência no Supabase (ADR 0017) adicionou SQL, RPCs e latência ao servidor sem necessidade de produto: a tabela não precisa ser compartilhada entre dispositivos nem ser universal; cada aparelho pode manter sua própria cache após cada upload. Também fazia sentido evitar supabase/row cleanup no cold start da Vercel.

## Decisão

1. Snapshot completo da tabela e histórico de busca ficam no **IndexedDB do navegador**.
2. Upload/normalização/busca acontecem no cliente; nenhuma chamada `/api/medicine-table`.
3. Cada dispositivo/navegador possui seu snapshot; não há regra/sincronização entre usuários/lojas.
4. Após limpar dados do site, a planilha precisa ser enviada novamente.
5. Histórico local limitado a 60 registros/30 dias; snapshot não tem limite artificial necessário para planilhas comuns.
6. Rota `/medicine-table` pode ficar estática/cache placeholder; sem endpoint ou estado de dados do servidor.

## Consequências

- Busca instantânea, sem latência de rede/Supabase/RPC.
- Sem persistência no banco; zero custo de linha por upload.
- Usuários diferentes ou até o mesmo usuário em PCs distintos precisam subir/limpar dados separadamente.
- Dados ficam vulneráveis apenas ao browser do dispositivo e à limpeza do site.

## Alternativas consideradas

- Supabase tabela (ADR 0017): rejeitada como solução padrão; mantém complexidade, custo e latência para uma necessidade local.
- Persistir na rota/cache do servidor apenas (instabilidade Vercel) ou `localStorage` (~5 MB): rejeitadas.

## Referências

- [ADR 0017](./0017-persistencia-tabela-medicamentos.md)
- `src/services/medicineTableStore.ts`
- `src/hooks/useMedicineTable.ts`
- `src/utils/medicineTableSearch.ts`
