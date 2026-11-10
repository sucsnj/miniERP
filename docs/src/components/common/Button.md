# `src/components/common/Button.tsx`

> Botão compartilhado com variantes funcionais, tamanhos e estado de carregamento.

## O que faz

- Renderiza um `button` nativo repassando todas as props HTML.
- Aceita `variant` (`primary`, `success`, `danger`, `warning`, `info`, `secondary`, `outline`, `ghost`), `size` (`sm`, `md`, `lg`), `leftIcon`, `rightIcon`, `isLoading` e `iconOnly`.
- Em `iconOnly`, exibe apenas o ícone, usa dimensões quadradas e mantém `children` como rótulo acessível oculto.
- Quando o conteúdo estoura, oculta o ícone; em telas pequenas, oculta o rótulo de botões com ícone.

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // alias legado de leftIcon
  isLoading?: boolean;
  iconOnly?: boolean;
}
```

## Relações

- **Usa:** `button.module.css` e os tokens de `tokens.css`.
- **Usado por:** páginas e componentes que precisam de ações padronizadas.

## Notas

- `icon` permanece como alias temporário; novas chamadas devem usar `leftIcon`.
- Em `iconOnly`, informe `aria-label` ou passe `children` para gerar o rótulo acessível.
- Padrão registrado no ADR 0010; a substituição dos botões legados é gradual.
