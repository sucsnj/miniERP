# ADR 0020 — Tabela de medicamentos: planilha CMED, aba relevante e UF de referência

- **Status:** aceita

## Contexto

O upload local-first (ADR 0018) herdou o mapeamento de colunas da normalização para inglês (ADR 0004) e passou a ler apenas `substance`, `laboratory`, `product` etc., enquanto a planilha oficial da CMED (`Lista_PMC_*.xlsx`) usa cabeçalhos pt-BR (`SUBSTÂNCIA`, `LABORATÓRIO`, `EAN 1`, `PRODUTO`, `APRESENTAÇÃO`, `CLASSE TERAPÊUTICA`). Além disso, o arquivo traz abas auxiliares ("Cabeçalho") e dezenas de colunas PF/PMC por alíquota; o sistema precisava escolher a referência de preço correta sem depender da ordem das colunas.

## Decisão

1. Manter a exceção de nomes pt-BR apenas na leitura da planilha da tabela de medicamentos; identificadores de código continuam em inglês (ADR 0004).
2. Detectar a aba relevante pelos cabeçalhos normalizados (substância/EAN/produto e as colunas PF/PMC da UF); descartar as demais do workbook em memória antes de normalizar/cachear.
3. Configurar a UF de referência por dropdown antes do upload; PE é a única opção inicial, usando `PF 20,5 %` e `PMC 20,5 %` (não as variantes `... ALC`).
4. Normalizar cada linha guardando `priceColumns` com todas as colunas `pf*`/`pmc*`; `pf205`/`pmc205` são derivados da UF escolhida.
5. Persistir a UF no IndexedDB (`settings:uf`) e sempre inicializar com uma UF válida (padrão PE).
6. Ao trocar a UF, recalcular PF/PMC a partir de `priceColumns` e limpar o histórico de buscas; snapshots antigos sem `priceColumns` exigem reenvio da planilha.

## Consequências

- A planilha oficial volta a carregar e a busca retorna os valores correspondentes.
- Abas auxiliares não poluem o cache; a referência de preço não depende da posição da coluna.
- Trocar de UF não exige reenvio, mas invalida o histórico; o cache por linha cresce com as colunas de preço adicionais.
- Novas UFs entram como nova opção de configuração, sem mudar o parser.

## Alternativas consideradas

- Traduzir a planilha para nomes ingleses: rejeitado — a planilha é externa (CMED) e muda periodicamente.
- Usar sempre a primeira aba/coluna fixa: rejeitado — o arquivo tem aba de cabeçalho e várias alíquotas.
- Exigir reenvio a cada troca de UF: rejeitado — o usuário escolheu recálculo imediato a partir das colunas em cache.

## Referências

- `src/hooks/useMedicineTable.ts`, `src/utils/medicineTableSearch.ts`, `src/services/medicineTableStore.ts`, `src/pages/medicine-table.tsx`
- `docs/src/utils/medicineTableSearch.md`
- [ADR 0004](./0004-padrao-de-nomenclatura-dos-identificadores.md), [ADR 0018](./0018-tabela-medicamentos-localstorage-indexeddb.md)
