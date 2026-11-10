# ADR 0001 — Documentação do código por blocos

_Status: em andamento (bloco 1 — Vendas/Dashboard — em execução; validação contra a implementação feita por bloco)._

## Contexto/Problema

- A documentação em `docs/` contém muitos arquivos como **rascunho (stubs)** aguardando validação, além de docs antigos potencialmente desatualizados em relação ao código.
- A regra de ouro do projeto é **documentação antes de código**; sem docs confiáveis, o agente/desenvolvedor precisa reler o código constantemente.
- É preciso preencher/validar os docs lendo a implementação real, de forma organizada e revisável.

## Decisão

- Documentar o código em **blocos por domínio de negócio**:
  1. **Vendas/Dashboard** — página `index`, APIs (`vendas`, `venda-itens`, `mensais`, `backup`), `vendasService`, `db` (vendas), componentes de venda, hooks e **PIX** + formulários de item/serviço.
  2. Produtos/Estoque.
  3. Contas a pagar.
  4. OCR/Tabela/Notas e demais áreas.
- **Formato**: manter o padrão atual (Descrição, Responsabilidades, Funções Principais, Props/Dependências, Observações) e **adicionar assinaturas de funções e payloads de request/response** das APIs.
- **Só documentação**: nenhuma alteração de comportamento do código. Suspeitas de problemas são anotadas na seção Observações do doc correspondente.
- **Checkpoint por bloco**: apresentar resumo do bloco e aguardar OK antes de seguir.
- Registrar docs novos/alterados em `docs/README.md` (índice) e, quando relevante, em `docs/CONTEXT.md`.
- Ao validar, remover o marcador "_Status: rascunho" do topo do doc, mantendo título e caminho.

## Alternativas consideradas

- Documentar tudo de uma vez: descartado (sessão longa e revisão difícil).
- Apenas diagnóstico (gap analysis): descartado (adiaria a entrega útil de docs).
- Corrigir código durante a documentação: descartado (escopo documental; problemas ficam apenas anotados).

## Consequências

- **Positivas**: docs fiéis ao código; agente para de reler código; base sólida para ADRs futuros e para a tabela "Tema → Documentos".
- **Negativas**: custo de leitura de código nesta fase; docs novos podem revelar retrabalho/divergências.
- **Riscos**: leitura parcial de um arquivo gera doc impreciso → mitigar lendo o arquivo inteiro de cada alvo do bloco.

## Glossário relacionado

Ver `docs/glossary.md`.