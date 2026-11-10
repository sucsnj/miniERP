# `src/services/ocrService.ts`

## Descrição

Serviço de **OCR de boletos** usando `tesseract.js`. Processa uma imagem e tenta extrair a linha digitável (bancária) por regex.

## Funções

```ts
lerLinhaDigitavel(imagemPath: string, regexConst: string = "regex1"): Promise<string | null>
```

## Comportamentos

- Cria um worker Tesseract com idioma `eng` e define whitelist `"0123456789. "` (só dígitos, ponto e espaço), aumentando a precisão para boletos.
- Normaliza o texto reconhecido: remove quebras de linha e espace corridos.
- Aplica uma das duas regex de linha digitável:

```
regex1 = /\d{5}\.?\d{5}\s?\d{5}\.?\d{6}\s?\d{5}\.?\d{6}\s?\d\s?\d{14}/g
regex2 = /\d{5}[\s\.]?\d{5}[\s\.]?\d{5}[\s\.]?\d{6}[\s\.]?\d{5}[\s\.]?\d{6}[\s\.]?\d[\s\.]?\d{13,14}/g
```

- `regexConst` escolhe o padrão: `"regex1"` (default) ou qualquer outro valor ativa `regex2`. `regex2` aceita separadores opcionais (`[\s\.]?`) e 13–14 dígitos no verificador.
- Coleta **todos os matches** e retorna o **último** encontrado, com pontos e espaços removidos (linha digitável "crua", sem formatação).
- Retorna `null` se não houver match ou se ocorrer erro (logado via `console.error`).
- O worker é encerrado (`worker.terminate()`) em sucesso; em erro de Tesseract o `catch` devolve `null` (sem garantir terminate).

## Observações

- Função server-side: usada pelo endpoint `src/pages/api/ocr.ts` (imagens e PDFs convertidos) e por `pdfService.ts`.
- Loga bastante (`console.log`) o caminho, texto e matches — ruído proposital para depuração.
- A whitelist e as regex são específicas de **boleto bancário com barras numéricas**; notas/outros layouts podem falhar.

## Uso

- `src/pages/api/ocr.ts` (caminho direto) e `src/services/pdfService.ts` (`lerPdfComOcr` para PDF de 2 a 3 páginas).