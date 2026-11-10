# `src/components/DailySaleForm.tsx`

## Descrição

Componente de formulário usado na página principal para registrar vendas diárias. Também mostra histórico recente e permite operações de edição/exclusão.

## Contexto

Utilizado no Dashboard de Vendas para registrar vendas diárias.

## Responsabilidades

- Exibir campos de data, valor e observações.
- Permitir cálculos matemáticos no campo de valor (`+`, `-`, `*`, `/`).
- Chamar `registrarVenda()` do serviço de vendas.
- Mostrar mensagens com `Toast`.
- Exibir as últimas 4 vendas e ações rápidas de edição/exclusão.

## Assinatura

```ts
export interface CartItem {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  preco_venda: number;
  quantidade: number;
  codigo_interno?: string;
  referencia?: string;
  estoque?: number;
}

interface DailySaleFormProps {
  sales?: VendaDiaria[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaleAdded?: () => void;
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
  showHistory?: boolean;
}

const DailySaleForm: React.FC<DailySaleFormProps>;
```

## Props

- `sales` - lista de vendas atuais (default `[]`).
- `selectedDate` - data selecionada para registro.
- `onDateChange` - callback para atualizar data.
- `onSaleAdded` - callback após inserir venda.
- `onEditSale` - callback para iniciar edição.
- `onDeleteSale` - callback para excluir.
- `showHistory` - controla se o painel de histórico aparece (default `true`).

## Dependências

- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).
- `validation` (`validateCurrency`, `validateDate`).
- `expr-eval` (`Parser`) - cálculo de expressões no campo de valor.
- `useShortcuts` (captura de atalhos de teclado).
- `highlightField` (`src/utils/forms`).
- `useCart` (estado do carrinho, compartilhado com `EditSaleForm`).
- `buildPixPayload` (`src/utils/pix`) + `ModalPix` (geração de QR PIX).
- `ModalCarrinho`, `ModalSelecionarItens`.
- `Toast`.
- `useEffect`, `useRef`, `useState`.

## Exemplo de uso

```tsx
<DailySaleForm
  sales={sales}
  selectedDate={selectedDate}
  onDateChange={onDateChange}
  onSaleAdded={onSaleAdded}
  onEditSale={onEditSale}
  onDeleteSale={onDeleteSale}
  showHistory={showHistory}
/>
```

## Observações

- Envia dados para `/api/vendas` via `src/services/vendasService`.
- Usa `expr-eval` para calcular expressões no campo de valor.
- Possui lógica de limpeza com `Escape` para limpar o campo.
- O campo de valor filtra teclas: só números, operadores `+ - * / ( ) . ,` e teclas de navegação; bloqueia símbolos duplicados e operadores consecutivos.
- Gera payload PIX (via `buildPixPayload`) e abre `ModalPix` com o QR Code para pagamento.
- Exibe o total do carrinho (`totalCartValue`) e integra com o formulário de edição (`EditSaleForm`).
