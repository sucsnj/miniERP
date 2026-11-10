import { useState } from "react";
import { useToast } from '../../hooks/useToast';
import styles from '../../styles/ocrUpload.module.css';

interface OcrResult {
    arquivo: string;
    linha?: string;
    erro?: string;
}

// Handler de API ou componente exportado.
export default function OcrUpload() {
    const readRecentOcr = (): OcrResult[] | null => {
        try {
            const ocrJson = localStorage.getItem("ocrRecente");
            return ocrJson ? (JSON.parse(ocrJson) as OcrResult[]) : null;
        } catch {
            return null;
        }
    };

    const [results, setResults] = useState<OcrResult[] | null>(readRecentOcr);

    // Notificações (toast) do store global
    const { showToast } = useToast();

    // Função de upload
    async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {

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
            setResults(data);

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
    function copyContent(text: string) {

        navigator.clipboard.writeText(text)
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
                className={`${styles.ocrUpload}`} multiple onChange={uploadFile} />

            {results && (
                <div className={`${styles.ocrResults}`}>
                    {results.map((item: OcrResult, index: number) => (
                        <pre
                            key={index}
                            className={`${styles.ocrUploadWrapper}`}
                            onClick={() => copyContent(item.linha || '')}>
                            <strong>{item.arquivo}</strong>
                            {"\n"}
                            {item.linha || item.erro}
                        </pre>
                    ))}
                </div>
            )}
</div>
    );
}