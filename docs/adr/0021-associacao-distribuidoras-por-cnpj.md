# ADR 0021 — Associação de distribuidoras por CNPJ/CPF na importação de XML

- **Status:** aceita

## Contexto

A importação XML associava distribuidoras apenas pelo nome do emitente (`emit.xNome`) via aliases. Nomes variam entre notas (abreviações, espaços, acentos) e duas distribuidoras distintas podem ter nomes parecidos, gerando match incorreto. O CNPJ do emitente (`emit.CNPJ`/`emit.CPF`) é estável e único, portanto mais seguro como chave de associação.

## Decisão

1. Adicionar `taxId` (CNPJ 14 dígitos ou CPF 11 dígitos) ao `DistributorConfig`, normalizado apenas para dígitos.
2. `findDistributor(config, emitter, emitterTaxId)` prioriza match exato por `taxId` (se presente e válido) antes de procurar aliases por nome.
3. Ao criar distribuidora a partir do XML ou do modal de distribuidora ausente, capturar `emit.CNPJ`/`emit.CPF` e gravá-lo automaticamente; o usuário também pode informar/editar manualmente em `/settings`.
4. Aliases continuam como fallback para casos sem CNPJ/CPF ou para nomes alternativos; não são a chave primária.
5. Validação: `taxId` aceito apenas com 11 ou 14 dígitos; inválido é descartado (não bloqueia a importação).

## Consequências

- Associação mais robusta e imune a variações de grafia.
- Configurações antigas sem `taxId` continuam funcionando via aliases (compatibilidade retroativa).
- Criação de distribuidora no fluxo de importação passa a preencher o CNPJ automaticamente quando disponível.
- UI de `/settings` ganha campo de CNPJ/CPF e exibe o valor cadastrado.

## Alternativas consideradas

- Manter apenas aliases: rejeitado — instável diante de variações de nome.
- Exigir CNPJ em toda distribuidora: rejeitado — quebraria configurações existentes e emitentes sem CNPJ.

## Referências

- `src/utils/distributors.ts`, `src/services/payablesImport.ts`, `src/services/adminService.ts`
- `src/components/payables/DistributorSettings.tsx`, `src/components/payables/MissingDistributorModal.tsx`
- `src/pages/api/payables/import.ts`
- [ADR 0019](./0019-distribuidoras-configuraveis-regras-xml.md)
