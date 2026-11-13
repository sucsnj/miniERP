# ADR 0014 — OCR local de boletos com IndexedDB

- **Status:** aceita

## Contexto

O OCR de boletos foi removido pela migração ADR 0012 por depender de `pdf2pic` e de binários de sistema (Ghostscript/GraphicsMagick) incompatíveis com a Vercel. O código remanescente mantinha upload em disco, histórico em `localStorage`, pipeline excessivamente caro e configuração oculta `OCR_ENABLED = false`.

## Decisão

1. Reabilitar OCR de boletos como funcionalidade **local**, sem serviços externos.
2. Manter apenas o fluxo de **linha digitável**, sem preencher contas, sem extrair fornecedor/valor/vencimento e sem criar tarefas automáticas.
3. Processar **PDF e imagens** no mesmo endpoint admin-only `POST /api/ocr`.
4. PDFs limitados a **2 páginas**; PDF pesquisável é lido primeiro, PDF scanned é renderizado para imagem.
5. Manter o histórico do OCR no **IndexedDB do navegador**, nunca no servidor:
   - retenção máxima de **5 dias**;
   - no máximo 60 entradas;
   - sem armazenar imagens/PDFs;
   - limpar em busca explícita e no logout;
   - migrar/descartar `localStorage['ocrRecente']` ao montar.
6. Manter a funcionalidade visível apenas para **admin**.
7. PDFs passam a usar `unpdf` + `pdfjs-dist` e renderização via `@napi-rs/canvas`, sem instalação local de Ghostscript/GraphicsMagick.
8. Uploads pesados entram no RAM do servidor via `multer.memoryStorage()`, não em `./uploads` ou `./temp`; limites de volume, tamanho e MIME são obrigatórios.
9. Não implementar Python, serviço externo ou microserviço enquanto o fluxo local atender.

## Consequências

- OCR local funciona em desenvolvimento e em deploy serverless sem binários de sistema.
- Custo computacional continua alto em PDFs scanned; por isso o limite de 2 páginas.
- Resultados ficam limitados ao browser atual; limpar dados do site ou outro navegador não herda histórico.
- A privacidade é melhor: o servidor não retém PDFs/imagens; o browser só guarda a linha ou erro do OCR.
- Falhas parciais não interrompem o lote.

## Alternativas consideradas

- **Manter `pdf2pic` local:** rejeitada; quebra na Vercel e exige binários de sistema.
- **Serviço externo de OCR:** rejeitada por custo, privacidade e dependência de rede/contrato.
- **Python local primeiro:** adiada; só adotar se benchmark comprovar vantagem real da biblioteca Python.
- **Extrair somente linha de PDF pesquisável:** rejeitada; PDFs scanned são um caso de uso central do OCR.

## Referências

- [ADR 0012](./0012-migracao-sqlite-para-supabase.md)
- [ADR 0013](./0013-autenticacao-multiempresa-multiloja.md)
- `src/pages/api/ocr.ts`
- `src/services/pdfService.ts`
- `src/services/ocrService.ts`
- `src/services/boletoBarcode.ts`
- `src/services/ocrHistoryRepository.ts`
