# `src/components/OcrUpload.tsx`

## Descrição

Componente de **upload de boletos para OCR** (PDF/imagem), usado dentro do painel "Leitura de Contas" da página de Contas a Pagar. Envia arquivos para `/api/ocr` e lista os resultados (linha digitável ou erro), clicáveis para copiar.

## Interface

- **Props**: nenhuma.
- **Estado**: `resultado: any` (array de `{ arquivo, linha? , erro? }`), `ocrRecente: any`, `toastOpen`, `toastMessage`, `toastType`, `duration: number | null`.

## Funções

```ts
showToast(message, type, duration = 3000)
uploadArquivo(e: React.ChangeEvent<HTMLInputElement>)   // FormData 'files' (múltiplos) → POST /api/ocr
copiarConteudo(texto)                                   // navigator.clipboard.writeText(texto) + toast
```

## Comportamentos

- `<input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple>` dispara `uploadArquivo` no `onChange`.
- Upload: mostra toast "Carregando OCR..." com `duration: null` (não fecha); sucesso → toast "OCR finalizado!"; exceção → toast "Erro ao processar OCR" (`duration` default 3000).
- **Persistência:** após sucesso salva `JSON.stringify(data)` no `localStorage['ocrRecente']`; um `useEffect` no mount restaura esse OCR na carga (resultado anterior reaparece ao reabrir).
- Renderiza cada item como `<pre>` com `arquivo` + `linha` (ou `erro`); `onClick` copia só a **linha digitável** para a área de transferência.
- Resultado usa tipagem frouxa (`any`) — sem schema de validação do payload da API.

## Observações

- Dependência: `./Toast` (`duration` controlável, papel de toast de carregamento persistente).
- Não limpa `localStorage['ocrRecente']` em caso de falha; a lógica de copiar não valida `item.linha` (copia `undefined` se vier só o erro — o `pre` continua mostrando `item.linha || item.erro`).
- Componente não recebe nenhum prop (fica acoplado ao fluxo da página pai).

## Uso

- `src/pages/contas-a-pagar.tsx` (via `Agenda` → bloco "Leitura de Contas").