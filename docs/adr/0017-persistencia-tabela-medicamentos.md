# ADR 0017 — Persistência da tabela de medicamentos no Supabase

- **Status:** rejeitado / substituído por [ADR 0018](./0018-tabela-medicamentos-localstorage-indexeddb.md)

## Contexto

A tabela de medicamentos sempre funcionou localmente porque o upload gravava o XLSX em `./temp/tabela.xlsx` e o JSON normalizado em `./temp/tabela-table.json`. Na Vercel, o filesystem é efêmero: após deploy/cold start/another instanciação, o arquivo some, deixando `/medicine-table` sem dados/status/busca, apesar do histórico estar no Supabase.

## Decisão

1. Persistir o conteúdo da planilha em `medicine_table_rows` (tenant `company_id`), nunca em filesystem local/`uploads/` na runtime.
2. Substituir todas as linhas do tenant no upload via RPC atômica `replace_medicine_table_rows`; não acumular tabela antiga.
3. Buscar candidatos via RPC `search_medicine_table_rows` com nome de substância, laboratório, EAN, produto, apresentação, classe, preço e classe terapêutica, usando `unaccent + lower`; score replica a lógica anterior (`substance +100`, `ean exact +50`, `search_text +10`, `product +2`) e retorna até 200 linhas por CNPJ.
4. Endpoint continua servindo status/carga/busca/history e permanece admin-only; history por tenant permanece em Supabase.

## Consequências

- Tabela sobrevive a deploys/cold starts e a múltiplas instâncias serverless.
- Busca deixa de depender do disco local; Vercel funciona como localmente.
- Upload de tabela passa a gravar no banco/RPC; tabela grande (~50k linhas) passa por I/O/DB em vez de memória do servidor.
- Busca não é mais um scan em memória local; custo SQL é responsabilidade da função RPC.

## Alternativas consideradas

- **Gravar XLSX original no filesystem e reparsear:** rejeitada; filesystem da Vercel é efêmero e JSON/cache somem.
- **Guardar um snapshot JSONB no banco:** rejeitada; não existe índice/busca direta das linhas e response continua enorme para tabelas grandes.
- **Storage/API externo:** rejeitado por custo/dependência; Supabase já é fonte oficial.

## Referências

- `supabase/schema.sql`
- `supabase/migrations/0029-add-medicine-table-rows.sql`
- `src/pages/api/medicine-table.ts`
- `src/database/medicineTableRepository.ts`
