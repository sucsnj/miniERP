# `src/pages/api/contas/import.ts`

> Importa contas a pagar a partir do XML de NF-e (`nfeProc`) e registra a nota.

## O que faz

- `POST { xml }`: faz parse com `xml2js` e extrai distribuidora, duplicatas, emissão, total e chave.
- Normaliza distribuidora/documento/valores (`f&f` → `FF`; acréscimos: cimed +3,99; pro/profarma +1,39).
- Insere duplicatas inexistentes (`distribuidora`+`documento`) e registra a nota em `notas.db`.
- Responde `200 { sucesso, registros }`; `400` (`Arquivo XML não fornecido`, `Nota e duplicata(s) já existentes`, `Nada foi inserido`); `405` fora de POST.

## Relações

- **Usa:** `contasDb`, `notasDb`, `xml2js`, `number`/`date` (`parseCurrency`, `toDate`).
- **Usado por:** `../../contas-a-pagar.md` (`fetch('/api/contas/import')`).

## Notas

- Parsing sensível ao layout fixo de `nfeProc`; mudanças no schema exigem revisão.
