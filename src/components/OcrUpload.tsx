import { useState } from "react";
import Toast from './Toast';

interface OcrResultado {
    arquivo: string;
    linha?: string;
    erro?: string;
}

// Handler de API ou componente exportado.
export default function OcrUpload() {
    const lerOcrRecente = (): OcrResultado[] | null => {
        try {
            const ocrJson = localStorage.getItem("ocrRecente");
            return ocrJson ? (JSON.parse(ocrJson) as OcrResultado[]) : null;
        } catch {
            return null;
        }
    };

    const [resultado, setResultado] = useState<OcrResultado[] | null>(lerOcrRecente);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [duration, setToastDuration] = useState<number | null>(3000);

    // Função utilitária para abrir toast
    function showToast(message: string, type: "success" | "error" | "info", duration: number | null = 3000) {
        setToastMessage(message);
        setToastType(type);
        setToastDuration(duration);
        setToastOpen(true);
    }

    // Função de upload
    async function uploadArquivo(e: React.ChangeEvent<HTMLInputElement>) {

        if (!e.target.files?.[0]) return;

        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append("files", file);
        });

        // Mostra Toast de carregamento
        showToast("Carregando OCR...", "info", null);

        try {
            const response = await fetch("/api/ocr", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setResultado(data);

            // coloca o ocr recente num json
            const ocrJson = JSON.stringify(data);
            localStorage.setItem("ocrRecente", ocrJson);

            // Atualiza Toast para sucesso
            showToast("OCR finalizado!", "success");
        } catch (err) {
            console.error("Erro no OCR:", err);

            // Atualiza Toast para erro
            showToast("Erro ao processar OCR", "error");
        }
    }

    // Função de copiar conteúdo para a área de transferência (cópia apenas a linha digitável)
    function copiarConteudo(texto: string) {

        navigator.clipboard.writeText(texto)
            .then(() => {

                showToast("Linha digitável copiada!", "success");
            })
            .catch(err => {

                console.error("Erro ao copiar:", err);

                showToast("Erro ao copiar conteúdo", "error");
            });
    }

    return (
        <div>
            <input type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="ocr-upload" multiple onChange={uploadArquivo} />

            {resultado && (
                <div className="ocr-results">
                    {resultado.map((item: OcrResultado, index: number) => (
                        <pre
                            key={index}
                            className="ocr-upload-wrapper"
                            onClick={() => copiarConteudo(item.linha || '')}>
                            <strong>{item.arquivo}</strong>
                            {"\n"}
                            {item.linha || item.erro}
                        </pre>
                    ))}
                </div>
            )}

            <Toast
                open={toastOpen}
                message={toastMessage}
                type={toastType}
                duration={duration}
                onClose={() => setToastOpen(false)}
                position="top-right"
            />

            <style jsx>{`
                .ocr-results {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                }

                .ocr-upload-wrapper {
                    width: 100%;
                    padding: 0px 5px 5px 7px;
                    border-radius: 14px;
                    background: var(--surface-soft);
                    border: 1px solid var(--border);
                    color: var(--foreground);
                    backdrop-filter: blur(12px);
                    transition:
                        transform 0.2s ease,
                        background 0.2s ease,
                        border-color 0.2s ease,
                        box-shadow 0.2s ease;
                    overflow-x: auto;
                    line-height: 1.5;

                    white-space: pre-wrap;
                    word-break: break-word;
                    user-select: all;
                }

                .ocr-upload-wrapper:hover {
                    cursor: pointer;
                    background: var(--surface);
                    border-color: var(--border);
                    transform: translateY(-2px);
                    box-shadow:
                        0 8px 24px rgba(0, 0, 0, 0.18);
                }

                .ocr-upload-wrapper:active {
                    transform: scale(0.99);
                }

                .ocr-upload {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    background: var(--surface-soft);
                    color: var(--foreground);
                    backdrop-filter: blur(10px);
                    transition:
                        border-color 0.2s ease,
                        background 0.2s ease,
                        box-shadow 0.2s ease;
                    outline: none;
                }

                .ocr-upload:hover {
                    background: var(--surface);
                }

                .ocr-upload:focus {
                    border-color: var(--accent);
                    box-shadow:
                        0 0 0 4px var(--accent);
                    opacity: 0.3;
                }

                .ocr-upload::file-selector-button {
                    margin-right: 12px;
                    padding: 8px 14px;
                    border: none;
                    border-radius: 10px;
                    background: var(--surface);
                    color: var(--foreground);
                    cursor: pointer;
                    transition:
                        background 0.2s ease,
                        transform 0.2s ease;
                }

                .ocr-upload::file-selector-button:hover {
                    background: var(--surface-soft);
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}
