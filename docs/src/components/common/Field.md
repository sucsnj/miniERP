# `src/components/common/Field.tsx`

> Campo de formulário compartilhado (rótulo + input).

## O que faz

- Renderiza `label` e `input` vinculados por `id`.
- Gera `id` a partir do rótulo quando não informado.
- Usa `field.module.css`.

```ts
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
```

## Relações

- **Usa:** `field.module.css`.
- **Usado por:** formulários que precisam de campos padronizados.

## Notas

- Primitiva criada na Fase 2 do ADR 0007.
