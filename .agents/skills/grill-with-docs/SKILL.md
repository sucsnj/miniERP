---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
---

Call the Skill tool twice, for "grilling" and "domain-modeling".

## Idioma

Toda a comunicação com o usuário deve ser em **português (pt-BR)**: perguntas da entrevista, explicações, ADRs, glossário e qualquer outro artefato gerado. Mantenha os nomes de arquivos/caminhos como são, mas o conteúdo sempre em pt-BR.

## Alinhamento com o contexto do projeto

Este repositório segue a regra de ouro **documentação antes de código**. Antes de grillar um plano/design neste projeto:

1. **Carregue o contexto primeiro.** Rode `/context` (ou leia `docs/CONTEXT.md`, `docs/README.md` e `docs/DOCS.md`) e leia os docs das áreas afetadas (`docs/pages`, `docs/pages/api`, `docs/services`, `docs/database`, `docs/components`, `docs/hooks`, `docs/utils`). A entrevista deve partir da arquitetura real já documentada — não de suposições sobre o código.
2. **Destino dos artefatos gerados**:
   - **ADRs** → `docs/adr/` (ex.: `docs/adr/0001-<titulo-dash-case>.md`).
   - **Glossário** → `docs/glossary.md` (mantenha/amplie o existente, não recrie).
3. **Estrutura de cada ADR**: contexto/pergunta, decisão, alternativas consideradas, consequências e status. O status "rascunho (a validar via leitura de código)" deve constar no topo quando a decisão ainda não foi confirmada contra a implementação.
4. **Registre tudo no índice**: ao criar arquivo novo em `docs/`, adicione-o à `docs/README.md` e, se relevante, à tabela "Tema → Documentos" de `docs/CONTEXT.md`.
5. Sempre que o grilling revelar que um doc existente está desatualizado, atualize-o em vez de duplicar.
