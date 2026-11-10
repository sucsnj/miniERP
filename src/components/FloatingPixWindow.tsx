import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import { renderQr, pulseQr, QR_SIZE } from './QrPix';
import { copyToClipboard, downloadQrPng, printPixSheet, showToast, type PrintSheetData } from './ActionPix';

interface FloatingPixWindowProps {
  isOpen: boolean;
  onClose: () => void;
  payload: string;
  merchantName: string;
  merchantBank: string;
  amount: string | null;
  pixKey: string;
}

function FloatingPixWindowContent({
  isOpen,
  onClose,
  payload,
  merchantName,
  merchantBank,
  amount,
  pixKey,
}: FloatingPixWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== headerRef.current && !headerRef.current?.contains(e.target as Node)) return;
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="floating-pix-window"
      style={{
        left: position.x,
        top: position.y,
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
    >
      <div ref={headerRef} className="floating-header">
        <h2>QR Code PIX</h2>
        <button className="floating-close" onClick={onClose} aria-label="Fechar">
          <CloseIcon fontSize="small" />
        </button>
      </div>
      <div className="floating-body">
        <canvas ref={canvasRef} width={QR_SIZE} height={QR_SIZE} className={`qr-canvas ${qrLoaded ? 'loaded' : ''}`} />
        <div className="pix-info">
          <div className="info-row"><span>Nome:</span> <strong>{merchantName}</strong></div>
          <div className="info-row"><span>Banco:</span> <strong>{merchantBank}</strong></div>
          <div className="info-row"><span>Valor:</span> <strong>{amount ? `R$ ${Number(amount).toFixed(2).replace('.', ',')}` : 'Aberto'}</strong></div>
          <div className="info-row"><span>Chave:</span> <strong>{pixKey}</strong></div>
        </div>
      </div>
      <div className="floating-actions">
        <button className="action-button" onClick={handleCopy}>
          <ContentCopyIcon fontSize="small" /> Copiar
        </button>
        <button className="action-button" onClick={handleDownload}>
          <FileDownloadIcon fontSize="small" /> Baixar PNG
        </button>
        <button className="action-button" onClick={handlePrint}>
          <PrintIcon fontSize="small" /> Imprimir
        </button>
      </div>
    </div>
  );
}

export default function FloatingPixWindow(props: FloatingPixWindowProps) {
  if (!props.isOpen) return null;
  return createPortal(<FloatingPixWindowContent {...props} />, document.body);
}