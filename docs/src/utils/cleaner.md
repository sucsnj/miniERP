# `src/utils/cleaner.tsx`

> Limpeza dos arquivos temporários gerados pelo OCR (executa no servidor).

## O que faz

- `cleanTemp()` remove todos os `.png` da pasta `temp/` do processo.
- Usa `fs/promises` e `path`, resolvendo o diretório a partir de `process.cwd()`.

## Relações

- **Usado por:** `pdfService` (`../services/pdfService.md`), no fluxo de importação/OCR.
