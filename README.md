# Sistema de Gestão de Vendas

Aplicação de gestão de vendas diárias, contas a pagar e relatórios mensais. O sistema permite cadastrar e gerenciar vendas, controlar contas, gerar backups e consultar dados históricos.

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse no navegador:

```bash
http://localhost:3000
```

4. Para gerar o build de produção:

```bash
npm run build
```

## Documentação

A documentação detalhada do projeto está disponível em:

- [docs/README.md](docs/README.md) - índice central da documentação.

Lá você encontra a arquitetura do sistema, detalhes de páginas, endpoints de API, serviços, banco de dados e utilitários.

## Como começar

- Abra `src/pages/index.tsx` para ver o dashboard principal de vendas.
- Use `src/pages/contas-a-pagar.tsx` para gerenciar contas a pagar e importações.
- Consulte `src/pages/historico.tsx` e `src/pages/resumo.tsx` para relatórios e dados históricos.

## Estrutura básica

- `src/pages/` - rotas e páginas Next.js
- `src/components/` - componentes de interface reutilizáveis
- `src/services/` - chamadas a APIs internas
- `src/database/` - persistência SQLite local
- `src/utils/` - utilitários de formatação e lógica auxiliar

