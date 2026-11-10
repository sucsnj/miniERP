# `src/components/BarcodeManager.tsx`

## Descrição

Gerência a adição e controle dos código de barras dos produtos adicionados ao sistema.

## Contexto

Ultilizado durante o cadastro e edição de produtos.

## Responsabilidades

- Adicionar código de barras.
- Editar código de barras.
- Excluir código de barras.

## Props

- `data` - dados do componente.
    - `codigosBarras` - códigos de barras do produto.
    - `novoCodigoBarras` - novo código de barras.
- `actions` - ações do componente.
    - `adicionar` - adicionar código de barras.
    - `definirPrincipal` - definir código de barras como principal.
    - `alterar` - alterar código de barras.
    - `remover` - remover código de barras.
- `inputRef` - `React.RefObject<HTMLInputElement | null>`; ref do input, aplicada via `ref={inputRef}`. Prop separada de `data` (refs não devem trafegar dentro do objeto de dados).

## Dependências

- `styles/produtos.module.css` (estilos).
- `src/services/produtosService.ts` (tipos e dados).
- `@mui/icons-material` (ícones).

## Exemplo de uso

```tsx
<BarcodeManager
  data={{
    codigosBarras,
    novoCodigoBarras,
  }}
  actions={{
    adicionar,
    definirPrincipal,
    alterar,
    remover,
  }}
  inputRef={inputRef}
/>
```

## Observações

- Componente de apresentação controlada: a validação de duplicidade e o vínculo de novos códigos ficam nos handlers do pai (`cadastro.tsx`), não neste componente.
- Enter no campo dispõe para adicionar o código atual (além do botão "Adicionar").
- Um código pode ser marcado como **Principal** (estrela); o botão de remoção e o título da estrela recebem `id`s com o código (`principal-star-<cod>`, `remove-barcode-<cod>`).
- Alguns estilos estão aplicados inline.