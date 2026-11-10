# `src/components/common/Table.tsx`

> Tabela compartilhada com rolagem horizontal.

## O que faz

- Envolve `table` em container com overflow horizontal.
- Aplica estilos base de tabela via `table.module.css`.
- Repassa props nativas da tabela.

```ts
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}
```

## Relações

- **Usa:** `table.module.css`.
- **Usado por:** listagens que precisam de tabela padronizada.

## Notas

- Primitiva criada na Fase 2 do ADR 0007.
