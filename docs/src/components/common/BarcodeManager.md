# `src/components/common/BarcodeManager.tsx`

> Gerenciador de códigos de barras do produto (apresentação controlada).

## O que faz

- Lista os códigos; adiciona (botão ou Enter), define principal (estrela) e remove.
- Sem estado: recebe `data`/`actions`; a validação de duplicidade fica no pai.

```ts
interface BarcodeManagerProps {
  data: { barcodes: BarcodeData[]; newBarcode: string };
  actions: {
    add: () => void; setAsPrincipal: (barcode: string) => void;
    change: (barcode: string) => void; remove: (barcode: string) => void;
  };
  inputRef: React.RefObject<HTMLInputElement | null>;
}
```

## Relações

- **Usa:** `BarcodeData` (`src/services/produtosService.ts`), `produtos.module.css`, ícones MUI (`Star`, `StarBorder`, `Close`).
- **Usado por:** formulário de cadastro/edição de produtos.

## Notas

- `inputRef` é prop separada (refs não trafegam no objeto `data`).
- `id`s por código (`principal-star-<cod>`, `remove-barcode-<cod>`); há alguns estilos inline.
