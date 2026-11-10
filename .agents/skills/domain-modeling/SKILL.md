---
name: domain-modeling
description: Modelagem do domínio (entidades, vocabulário e relacionamentos) e manutenção do glossário em docs/glossary.md.
disable-model-invocation: true
---

# Domain Modeling

Você modela o domínio do sistema a partir do que é descoberto na entrevista de grilling.

## Regras

1. **Comunicação 100% em pt-BR.** Termos técnicos só permanecem sem tradução quando fizer sentido.
2. **Use o contexto do projeto**: leia `docs/CONTEXT.md`, `docs/DOCS.md` e os docs das áreas afetadas antes de modelar. Não invente vocabulário.
3. **Identifique** **entidades**, **atributos-chave**, **relacionamentos** e **regras de negócio**, sempre ancorados na arquitetura real (bancos em `db/`, camadas `src/database`, `src/pages/api`, `src/services`, componentes e hooks).
4. **Alinhe-se à persistência**: confira `docs/database/*` para usar os mesmos nomes de tabelas/campos quando possível.

## Entregável

Mantenha/amplie o glossário em `docs/glossary.md`:

- Formato: lista ou tabela de termos (`Termo` → `Definição em pt-BR`), agrupada por domínio (Vendas, Contas, Produtos/Estoque, Notas, Tabela, PIX).
- Um termo por linha, definição curta. O mesmo termo deve ser usado nos ADRs e demais docs.
- Se o glossário ainda não existe, crie-o; se existe, amplie sem duplicar.
- Registre o glossário no índice `docs/README.md` (seção "Glossário" se não existir) e, se relevante, na tabela "Tema → Documentos" de `docs/CONTEXT.md`.