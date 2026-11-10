# ADR 0006 — Documentação de código espelhando `src/` em `docs/src/`

- **Status:** aceito e implementado (08/10/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 08/10/2026.

## Contexto

Após a padronização de arquivos/pastas em inglês (ADRs 0004/0005 e a rodada de hooks), a documentação em `docs/` ficou **desalinhada do código**: os docs eram planos (`docs/components/CartModal.md`) enquanto `src/components/` passou a ter subpastas por domínio; nomes de docs divergiam dos arquivos; havia docs multi-arquivo (`ModaisCadastro.md`, `Hooks.md`, `Utils.md`, `Types.md`) sem um mapa direto para o fonte e caminhos internos quebrados. A regra do projeto é "documentação antes de código" — sem espelho confiável, o agente volta a ler código-fonte para se orientar.

## Decisão

1. **Espelho**: a documentação de código vive em **`docs/src/`**, replicando exatamente a estrutura de `src/` — mesmo caminho e nome, com a extensão trocada para `.md` (`src/components/cart/CartModal.tsx` → `docs/src/components/cart/CartModal.md`; `src/hooks/useCart.ts` → `docs/src/hooks/useCart.md`). Documentos meta (CONTEXT, DOCS, ALIGNMENT, README, ADRs, glossário) permanecem na raiz de `docs/`.
2. **Template único** de doc de código (4 seções: resumo em citação, `## O que faz`, `## Relações`, `## Notas` opcional), alvo ≤ 30 linhas, definido em `docs/documentation-guidelines.md`.
3. **Índices de pasta** (quando existirem) são `README.md` dentro da pasta espelhada (ex.: `docs/src/hooks/README.md`); o índice central continua `docs/README.md`.
4. **Docs multi-arquivo dissolvidos**: `ModaisCadastro.md`/`ModaisDeProdutos.md` deram lugar a um doc por arquivo; `Hooks.md`/`Utils.md`/`Types.md` viraram `README.md` das respectivas pastas.
5. **Validação automática**: `node scripts/check-docs.mjs` falha se faltar doc para algum arquivo de `src/`, se houver doc órfão ou link interno quebrado.

## Consequências

**Positivas:**

- Navegação 1:1 entre código e documento (mesmo caminho relativo).
- Docs curtos e homogêneos, rápidos de ler; regra verificável por script (não depende de disciplina manual).
- Links internos e índice central passam a ser checados.

**Negativas / aceitas:**

- Toda criação/renome/movimentação em `src/` passa a exigir o mesmo movimento em `docs/src/` (custo coberto pelo `check-docs.mjs`).
- O nome do doc é o do arquivo-fonte, então divergências temporárias entre nome de arquivo e identificador exportado (ADR 0004) aparecem também nos títulos dos docs — mitigado pela nota "identificador ainda em pt-BR".

## Alternativas consideradas

- **Manter docs planos por camada** (`docs/components/`, `docs/hooks/`…): rejeitado — não acompanha as subpastas de domínio e dificulta localizar o doc de um arquivo.
- **Um único documento por camada** (`docs/components.md`): rejeitado — documentos longos, difíceis de manter e de validar automaticamente.
- **Gerar docs automaticamente do código**: rejeitado — perderia regras de negócio, relações de uso e histórico de refatoração que são o valor da documentação.

## Referências

- `docs/documentation-guidelines.md` (espelho + template único).
- `docs/adr/0001-documentacao-do-codigo.md` (documentação por blocos).
- `docs/adr/0004-padrao-de-nomenclatura-dos-identificadores.md` e `docs/adr/0005-agrupamento-de-componentes-por-dominio.md` (renomes que motivaram o espelho).
- `scripts/check-docs.mjs`.
