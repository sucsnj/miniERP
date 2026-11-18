# `src/components/payables/DistributorSettings.tsx`

> Card de settings para configurar distribuidoras e suas regras de importação XML.

## O que faz

- Carrega a configuração da empresa (`/api/admin/distributors`) e exibe a lista de distribuidoras com contagem de regras.
- Cria/edita/exclui distribuidoras (`name`) e aliases usados para casar `emit.xNome` do XML; o flag `enabled` fica como padrão habilitado para itens criados manualmente.
- Cada distribuidora aceita múltiplas regras tipadas (`amount_adjustment`: soma/subtrae `value`; `name_override`: renomeia nome final), em ordem.
- UI expõe formulário de criação de nova regra (quando não houver) ou edição de regra existente; cada regra pode ser removida/excluída individualmente.

## Relações

- Visual idêntico aos demais cards de configuração (mesmo `Panel` e `MASONRY_CARD_STYLE`).
- Lista de distribuidoras via dropdown; formulário de regras fica abaixo em uma coluna única.
- **Usado por:** [settings](../../pages/settings.md).
- **Usa:** [adminService](../../services/adminService.md).

## Notas

- Admin-only (a rota `/api/admin/distributors` exige `requireAdminApi`).
- O callback modificado persiste via `replaceDistributors`; a lista inteira é refeita na empresa.
