---
description: Invoca uma das skills do projeto. Use `fritar` → grill-with-docs ou `ensinar` → teach. Toda a comunicação em pt-BR.
---

O usuário executou `/skill` com o argumento: `$1`.

1. Se `$1` for `fritar` (ou `grill`): chame a ferramenta Skill com o nome `grill-with-docs` e siga as instruções dela.
2. Se `$1` for `ensinar` (ou `teach`): chame a ferramenta Skill com o nome `teach` e siga as instruções dela.
3. Se `$1` estiver vazio ou não for um valor reconhecido: **não prossiga**. Explique ao usuário que `/skill` só aceita `fritar` (grill-with-docs) ou `ensinar` (teach) e aguarde nova instrução.

Regras gerais:

- Toda a comunicação com o usuário deve ser em **português (pt-BR)**.
- Ao carregar a skill, siga as instruções dela e explique o que estiver fazendo em pt-BR.