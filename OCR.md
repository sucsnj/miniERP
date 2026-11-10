# OCR de Boletos (Imagem e PDF)

O sistema suporta:

* imagens (`.png`, `.jpg`, `.jpeg`)
* PDFs (`.pdf`)

## Dependências obrigatórias para OCR de PDF

Para funcionamento do OCR em PDFs no Windows é necessário instalar:

* GraphicsMagick
* Ghostscript

Sem essas dependências o sistema pode apresentar erros como:

```txt
Error: write EPIPE
```

---

# Instalação no Windows

## GraphicsMagick

Instalar via Chocolatey:

```powershell
choco install graphicsmagick -y
```

Testar:

```powershell
gm version
```

---

## Ghostscript

Instalar via Chocolatey:

```powershell
choco install ghostscript -y
```

Testar:

```powershell
gswin64c -version
```

---

# Instalação no Linux

### GraphicsMagick

Instalar via Apt:

```bash
sudo apt install graphicsmagick
```

Testar:

```bash
gm version
```

---

### Ghostscript

Instalar via Apt:

```bash
sudo apt install ghostscript
```

Testar:

```bash
gs -version
```

# Após instalação

Reiniciar:

* terminal
* VSCode
* servidor Next.js

---

# Fluxo do OCR

## Imagens

```txt
Imagem → Tesseract OCR → Regex → Linha digitável
```

## PDFs

```txt
PDF → pdf2pic → PNG → Tesseract OCR → Regex → Linha digitável
```

---

# Tecnologias utilizadas

* Tesseract.js
* pdf2pic
* GraphicsMagick
* Ghostscript
* Multer
* Next.js
