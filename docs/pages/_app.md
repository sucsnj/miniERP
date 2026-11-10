# `src/pages/_app.tsx`

## Descrição

Componente root do Next.js. Envolve todas as páginas com o provedor de cache `@tanstack/react-query` e renderiza a navegação global.

## Responsabilidades

- Injetar `QueryClientProvider` para toda a aplicação.
- Definir metadados HTML como título e descrição.
- Renderizar componente `Nav` global.

## Observações

- Este arquivo define configurações globais de cliente e estrutura de layout padrão.
- Pode ser estendido para incluir temas, erros ou persistência de estado global.
