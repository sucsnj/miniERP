# `src/utils/pixPrintPdf.ts`

> Helper de estilo e geração do PDF de impressão do PIX.

## O que faz

- `PixPrintData` descreve os dados impressos (`payload`, `name`, `bank`, `amount`, `key`).
- `printPixSheet(data)` gera um PDF de 148 × 210 mm com QR Code, dados do PIX, PIX Copia e Cola, valor e data/hora de geração.
- Estiliza o documento separadamente do modal: cabeçalho escuro, destaque verde de valor, cartões brancos e rodapé MINIERP.
- Abre o PDF em nova janela com `autoPrint({ variant: 'non-conform' })`; caso o navegador bloqueie a janela, dispara `doc.save(fileName)`.

```ts
interface PixPrintData {
  payload: string;
  name: string;
  bank: string;
  amount: string | null;
  key: string;
}
```

## Relações

- **Usa:** `jspdf` (import dinâmico) e `generateHighResPng` (`./qrPix.md`).
- **Usado por:** [pixModal](../components/pix/PixModal.md).

## Notas

- O PDF é autônomo; não depende de `window.print()`, folha oculta no DOM ou elementos `print-*`.
- Datas/horas usam `America/Recife`.
