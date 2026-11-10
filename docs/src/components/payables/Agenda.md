# `src/components/payables/Agenda.tsx`

> Painel de Contas a Pagar com Agenda, Próximas contas e Leitura de Contas (OCR).

## O que faz

- **Agenda**: agrupa `accountsYear` por vencimento somando pendentes; ordena e limita a 8 linhas.
- **Próximas contas**: pendentes ordenadas por vencimento, limite 12.
- **Leitura de Contas**: embute o [OcrUpload](../import/OcrUpload.md).

```ts
interface AgendaProps {
  accountsMonth: AccountDetails[]; // declarada e NÃO usada
  accountsYear: AccountDetails[]; // única fonte consumida
}
```

## Relações

- **Usa:** [OcrUpload](../import/OcrUpload.md), `AccountDetails` (`src/services/contasService.ts`), `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString`/`toTimestamp` (`src/utils/date.ts`), `contas.module.css`.
- **Usado por:** `../../pages/contas-a-pagar.md`.

## Notas

- `accountsMonth` é prop morta (não desestruturada) — candidata a remoção.
- "Atualização automática" é rótulo; não há polling, o painel apenas reflete as props.
- Estilos locais migrados de `styled-jsx` para `contas.module.css` (`agendaPanel`, `agendaCard`, `agendaList`, `agendaRow`); a classe órfã `ocr-upload-wrapper` foi removida do wrapper.
