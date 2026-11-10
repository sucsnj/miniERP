# ADR 0002 — Padrão de validação de campos (`{ ok, message }`)

**Status:** aceito e implementado (validado contra o código; lint, tsc e build verdes)

## Contexto / Pergunta

A validação de entrada está fragmentada e com contratos inconsistentes:

- `src/utils/validation.ts` expõe 4 funções com retornos heterogêneos: `validateEmail → boolean`, `validateCurrency → number | null`, `validateDate → Date | null`, `isEditableDate → boolean`. Elas misturam **validação sintática** com **normalização/parsing**.
- Campos obrigatórios ficam em `src/utils/forms.tsx`, separados do módulo de validação.
- Várias páginas e endpoints validam inline (sem mensagem padronizada, sem motivo do erro).
- Não há padrão único para mensagens de erro (pt-BR) nem para o feedback de formulário/API.

Pergunta: **qual contrato e arquitetura padronizam a validação de campos em todo o projeto?**

## Decisão

1. **Contrato único `ValidationResult`**: `{ ok: boolean; message: string | null }`, com mensagens **pt-BR hardcoded no módulo** (sem parametrização por chamada), para consistência total.
2. **Consumo por campo** (sem função agregadora tipo `validateFieldSet`): a página/endpoint chama cada validador e monta o resultado como já faz hoje.
3. **Desacoplar parsing de validação**: os normalizadores vivem fora do módulo — `parseCurrency` em `utils/number.ts` (nova) e `toDate` (já existente) em `utils/date.ts`; `validation.ts` expõe **apenas** validações `{ ok, message }`. Sem quebra de call sites: eles passam a usar os normalizadores.
4. **Campos obrigatórios no módulo**: `validateRequired` entra em `validation.ts`. Observação da implementação: `forms.tsx` já continha **somente** manipulação de DOM/UI (`highlightField`/`hideField`) — não havia validação de obrigatórios lá para migrar; apenas a doc foi corrigida.
5. **E-mail é campo válido**: chaves PIX por e-mail e campos de e-mail entram no padrão — `validateEmail` **migra** para o contrato `{ ok, message }` e permanece no módulo (relação com `pix.ts`, que já valida e-mail devolvendo `{ valid, error }`).
6. **Fronteira com regras de negócio**: `isEditableDate` (janela de 2 dias) **não é validação de campo**; removida de `validation.ts` e **unificada** com a regra já existente `canEdit` em `utils/edit.ts` (havia duplicidade). A API de vendas passou a usar `canEdit`.
7. **Campos cobertos** (escopo inicial da adoção):
   - **Vendas**: data, valor, observações, itens (nome, quantidade, preço).
   - **Contas a pagar**: distribuidora, valor, vencimento, documento, observações e **status da conta**.
   - **Produtos**: nome, descrição, ids (categoria/marca/fornecedor/unidade de medida), preços (compra/venda), margem, estoque, multiplicador, código interno, referência, barcodes.
   - **Cadastros auxiliares**: nome e descrição (categoria/marca), sigla e descrição (unidade de medida).
   - **Transversais**: obrigatório, ids numéricos, números não monetários (`validateNumber`), tamanho máximo de strings, e-mail.

## Alternativas consideradas

- **A. `boolean` puro** — simples, mas sem mensagem do motivo do erro; ruim para formulários e toasts. Rejeitada.
- **C. Normalizador + validação juntas** (`{ ok, message, value? }`) — menos chamadas, porém acopla parsing e validação; parsing já existe em `number.ts`/`formatter.tsx`. Rejeitada em favor de separar.
- **Mensagens parametrizadas por chamada** — flexível, porém abre espaço para mensagens divergentes; rejeitada (mensagens hardcoded garantem padronização).
- **Função agregadora (`validateFieldSet`)** — remove duplicação do laço de erros, mas o escopo escolhido foi o consumo por campo; ficou como melhoria futura opcional.

## Consequências

- Validação e mensagens uniformes em todas as páginas e endpoints (`ValidationResult` com pt-BR hardcoded).
- `validation.ts` fica puro (sem parsing nem regra de negócio); parsing em `number.ts`/`date.ts`.
- Call sites migrados para `parseCurrency`/`toDate`/`canEdit`: `vendas.ts`, `contas/import.ts`, `DailySaleForm`.
- Adoção incremental do contrato nos formulários: `contas-a-pagar.tsx` (distribuidora, valor, vencimento, documento), `cadastro.tsx` (nome, categoria, marca, fornecedor, unidade de medida, código de barras, ajuste de estoque) e hooks de cadastro (`useCategoria`, `useFornecedor`, `useMarca`, `useUnidadeMedida`) passam a usar `validateRequired`/`validateCurrency`/`validateNumber`/`validateDate`.
- **Fora do contrato (decisão registrada)**: regras de negócio nos call sites (ex.: "Valor deve ser um número maior que zero" em `contas-a-pagar.tsx`), validação de IDs/parâmetros dos endpoints internos (`!id || isNaN(Number(id))` em `api/produtos*`, `api/tabela`, `api/venda-itens`) e toasts de carga/erro de API (`produtos.tsx`, `tabela.tsx`, `useVendas`, `useMensais`) permanecem nos call sites/endpoints.
- `isEditableDate` consolidada em `canEdit` (`utils/edit.ts`); elimina a duplicidade da regra de 2 dias.
- `validateEmail` passou para o contrato `{ ok, message }`; e-mail é usado em chaves PIX (`pix.ts` valida com `{ valid, error }` — estrutura análoga) e como validador central do módulo.
- Métrica de qualidade: `npm run lint`, `npx tsc --noEmit` e `npm run build` limpos após a adoção.

## Referências

- `src/utils/validation.ts` (estado atual), `src/utils/forms.tsx`, `src/utils/number.ts`, `src/utils/formatter.tsx`.
- Call sites: `src/pages/api/vendas.ts`, `src/pages/api/contas/import.ts`, `src/components/DailySaleForm.tsx`.
- Regras de boas práticas: `AGENTS.md` (validação centralizada, sem `any`), `docs/CONTEXT.md` (regra 6).