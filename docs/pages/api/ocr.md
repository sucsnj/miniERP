# `src/pages/api/ocr.ts`

## Descrição

Endpoint de **OCR de boletos** — recebe uploads (PDF/imagem) via multipart, processa a leitura da linha digitável e retorna os resultados por arquivo.

## Configuração

- `config.api.bodyParser = false` — o corpo é parseado pelo `multer` manualmente.
- `multer({ dest: "uploads/" })`; campo de upload: `upload.array("files")` (múltiplos arquivos sob o nome `files`).

## Métodos

### `POST /api/ocr`

Multipart (`files` — um ou mais arquivos).

- **405** se método ≠ POST (`{ error: 'Método não permitido' }`).
- **400** se nenhum arquivo enviado (`{ error: 'Nenhum arquivo enviado' }`).
- Cria `./temp` se não existir.
- Por arquivo, decide pelo `path.extname(originalname).toLowerCase()`:
  - `.pdf` → `lerPdfComOcr(file.path)` (converter páginas 1–3 e OCR);
  - demais → `lerLinhaDigitavel(file.path)` (imagem direta).
- Sucesso → `{ arquivo: file.originalname + info, linha }`. Falha própria → `{ arquivo, erro: 'Erro no OCR' }`. Exceção → `{ arquivo, erro: 'Falha ao processar arquivo' }`.
- No `finally`, remove o arquivo de upload (`fs.unlinkSync(file.path)`).
- Resposta **200**: array com um item por arquivo.

```
[{ arquivo: 'boleto.pdf (ocr inconsistente)', linha: '104920005000034...' }]
[{ arquivo: 'nota.pdf', erro: 'Erro no OCR' }]
```

## Observações

- A flag `info` (de `pdfService`) é sufixada ao nome do arquivo quando a linha só foi obtida com `regex2` — indica leitura inconsistente.
- Não guarda estado entre requisições; os arquivos temporários de processamento ficam em `./temp` e são limpos por `cleanTemp()` no `pdfService`.
- `runMiddleware` (Promise wrapper do multer) é duplicado na API `tabela.ts`.

## Uso

- `src/components/OcrUpload.tsx` (formData com campo `files`).