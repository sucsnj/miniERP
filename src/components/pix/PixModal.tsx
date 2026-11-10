import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { renderQr, pulseQr, QR_SIZE } from '@/utils/qrPix';
import { downloadQrPng, printPixSheet, type PrintSheetData } from '@/utils/pixActions';
import { showToast } from '@/utils/toast';
import { copyToClipboard } from '@/utils/clipboard';
import { useFocusTrap } from '../../utils/focus';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@/components/common/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: string;
  merchantName: string;
  merchantBank: string;
  amount: string | null;
  pixKey: string;
}

const ModalPixContent: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  payload,
  merchantName,
  merchantBank,
  amount,
  pixKey,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrLoaded, setQrLoaded] = React.useState(false);

  useFocusTrap(dialogRef, isOpen);

  // Fecha com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Renderiza QR Code quando abre
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    let mounted = true;
    (async () => {
      try {
        await renderQr(canvasRef.current!, payload);
        if (mounted) {
          setQrLoaded(true);
          pulseQr(containerRef.current);
        }
      } catch {
        if (mounted) showToast('Erro ao gerar QR Code', 'error');
      }
    })();
    return () => { mounted = false; };
  }, [isOpen, payload]);

  const handleCopy = async () => {
    await copyToClipboard(payload, () => showToast('PIX Copia e Cola copiado!'), (e) => showToast('Erro ao copiar: ' + String(e), 'error'));
  };

  const handleDownload = async () => {
    try {
      await downloadQrPng(payload);
      showToast('QR Code salvo como PNG!');
    } catch {
      showToast('Erro ao baixar QR Code', 'error');
    }
  };

  const handlePrint = async () => {
    const data: PrintSheetData = {
      payload,
      name: merchantName,
      bank: merchantBank,
      amount,
      key: pixKey,
    };
    await printPixSheet(data);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-pix"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pix-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div className="modal-header">
          <h2 id="pix-modal-title">QR Code PIX</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
            leftIcon={<CloseIcon fontSize="small" />}
          />
        </div>

        {/* Corpo do Modal com Rolagem */}
        <div className="modal-body" ref={containerRef}>
          <canvas ref={canvasRef} width={QR_SIZE} height={QR_SIZE} className={`qr-canvas ${qrLoaded ? 'loaded' : ''}`} />
          <div className="pix-info">
            <div className="info-row"><span>Nome:</span> <strong>{merchantName}</strong></div>
            <div className="info-row"><span>Banco:</span> <strong>{merchantBank}</strong></div>
            <div className="info-row"><span>Valor:</span> <strong>{amount ? `R$ ${Number(amount).toFixed(2).replace('.', ',')}` : 'Aberto'}</strong></div>
            <div className="info-row"><span>Chave:</span> <strong>{pixKey}</strong></div>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="modal-actions">
          <Button className="action-button" variant="info" onClick={handleCopy} leftIcon={<ContentCopyIcon fontSize="small" />}>
            Copiar
          </Button>
          <Button className="action-button" variant="secondary" onClick={handleDownload} leftIcon={<FileDownloadIcon fontSize="small" />}>
            Baixar PNG
          </Button>
          <Button className="action-button" variant="outline" onClick={handlePrint} leftIcon={<PrintIcon fontSize="small" />}>
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default function PixModal(props: PixModalProps) {
  if (!props.isOpen) return null;
  return <ModalPixContent {...props} />;
}