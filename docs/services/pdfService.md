# `src/services/pdfService.ts`

## Descrição

Serviço de **conversão e pré-processamento de PDF → imagem** para o OCR de boletos. Converte páginas de PDF em PNG, aplica múltiplos cenários de ajuste de imagem (`sharp`) e tenta a leitura da linha digitável até obter sucesso.

## Funções

```ts
cropRegions(imgPath: string): Promise<string[]>                // não exportada (local)
preprocessScenarios(imgPath: string): Promise<string[]>         // não exportada (local)
lerPdfComOcr(pdfPath: string): Promise<string | null>
export let info: string                                        // flag global de inconsistência (' (ocr inconsistente)' ou '')
```

## Comportamentos — `lerPdfComOcr`

1. Converte o PDF com `pdf2pic` (`fromPath`, `density: 400`, PNG `2480x3508`, salvos em `./temp` com prefixo `pagina`) e processa as **páginas 1 a 3** (`for i = 1..3`); pula páginas sem `page.path`.
2. Para cada página:
   - Primeiro tenta `lerLinhaDigitavel(imgPath)` (padrão).
   - Se falhar, gera os **12 cenários** de `preprocessScenarios` e testa cada um até achar linha.
   - Se ainda falhar, corta **3 regiões** com `cropRegions` (inferior `70–100%`, intermediária `40–70%`, ampla `30–80%`) e testa cada uma.
   - Se achar linha: **zera `info`**, limpa `./temp` (`cleanTemp`) e retorna.
   - Se não: refaz com `lerLinhaDigitavel(imgPath, "regex2")`, seta `info = " (ocr inconsistente)"`, limpa `./temp`; retorna a linha se houver.
3. Retorna `null` se nenhuma das 3 páginas produziu linha.

## Comportamentos — `preprocessScenarios`

Gera arquivos `<arquivo>.{basic,contrast,smooth,lowThresh,highThresh,bright,bigBlur,linear,superBright,superDark,noiseReduction,maxScale}.png`, todos com `grayscale()` + `threshold()` (140–240) e variações de resize (1000–2500 px), `linear` (contraste) e `blur` (0.5–2).

## Comportamentos — `cropRegions`

Extrai com `sharp.extract` as regiões inferior, intermediária e ampla da imagem original, salvas como `<arquivo>.{bottom,mid,wide}.png`.

## Observações

- Depende de `src/utils/cleaner.tsx` (`cleanTemp`), que apaga todos os `.png` de `./temp`.
- Linha do código: o comentário `// const preImgPath = await preprocess(imgPath)` indica um passo de pré-processamento simples que foi abandonado em favor dos cenários.
- `info` é global exportado e consumido pelo endpoint `src/pages/api/ocr.ts` para sufixar o nome do arquivo com " (ocr inconsistente)".

## Uso

- `src/pages/api/ocr.ts` para arquivos `.pdf`.