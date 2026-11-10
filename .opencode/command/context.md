---
description: Carrega o contexto do projeto a partir da documentação em docs/, para que o agente entenda o sistema sem reler o código constantemente.
---

# Comando `/context`

Carregue o contexto deste projeto a partir da documentação antes de trabalhar. Não explore o código por conta própria neste comando — use apenas os documentos descritos abaixo.

## Passos

1. Leia `docs/CONTEXT.md` — mapa rápido do sistema e regras para agentes.
2. Leia `docs/README.md` — índice central de toda a documentação.
3. Leia `docs/DOCS.md` — arquitetura, fluxo de dados e riscos.
4. Tema específico (opcional): se `$ARGUMENTS` mencionar um tópico (ex.: `vendas`, `produtos`, `contas`, `pix`, `hooks`, `api`, `cadastro`, `estoque`, `relatorios`, `backup`, `ocr`, `tabela`), localize no índice quais documentos o cobrem e leia-os agora.
5. Só leia código-fonte se a documentação for insuficiente ou desatualizada. Quando isso acontecer, atualize o documento correspondente em `docs/` com o que descobriu, para não reler o mesmo código na próxima sessão.
6. Quando terminar, resuma em poucas linhas o contexto carregado e aponte qualquer lacuna na documentação encontrada.

## Regra de ouro

Prefira sempre a documentação (`docs/`) ao código-fonte. Leitura de código deve ser a exceção, não a regra — economize contexto.