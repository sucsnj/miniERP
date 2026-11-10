# `src/components/Toast.tsx`

## Descrição

Componente de notificação flutuante que exibe mensagens para o usuário.

## Contexto

É usado em diversos componentes para exibir mensagens de sucesso, erro ou informação ao usuário.

## Responsabilidades

- Exibir mensagens de forma clara e visível.
- Permitir o fechamento manual pelo usuário.
- Controlar o tempo de exibição.

## Assinatura

```ts
interface ToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  position?:
    | 'top-right'
    | 'bottom-right'
    | 'top-left'
    | 'top-center'
    | 'local-top-right'
    | 'local-top-left';
  duration?: number | null;
}

const Toast: React.FC<ToastProps>;
```

## Props

- `open` - indica se o toast deve ser exibido.
- `message` - mensagem a ser exibida.
- `type` - tipo de mensagem ('success', 'error', 'info'); default `'info'`.
- `onClose` - callback para fechar o toast.
- `position` - posição do toast na tela; default `'top-right'`.
- `duration` - tempo de exibição em milissegundos; default `3000`; se `null`, não fecha automaticamente.

## Dependências

- `useEffect`

## Observações

- O toast é fechado automaticamente após o tempo definido em `duration`.
- Pode ser posicionado em diferentes locais da tela.