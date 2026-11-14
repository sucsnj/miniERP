import { generateHighResPng } from './qrPix';

export interface PixPrintData {
  payload: string;
  name: string;
  bank: string;
  amount: string | null;
  key: string;
}

const PAGE_BACKGROUND: [number, number, number] = [244, 247, 250];
const SURFACE: [number, number, number] = [255, 255, 255];
const PRIMARY: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [100, 116, 139];
const ACCENT: [number, number, number] = [34, 197, 94];
const BORDER: [number, number, number] = [226, 232, 240];

const formatAmount = (amount: string | null) => {
  if (!amount) return 'Valor aberto';

  const parsed = Number(amount.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) return 'Valor aberto';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parsed);
};

const formatGeneratedAt = () => new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'America/Recife',
}).format(new Date());

const sanitizeFilenamePart = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 48);

const drawHeader = (doc: import('jspdf').jsPDF, merchantName: string, bank: string) => {
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 148, 30, 'F');

  doc.setFillColor(...ACCENT);
  doc.rect(0, 30, 148, 2, 'F');

  doc.setTextColor(...SURFACE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('Pagamento PIX', 10, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Recebedor', 10, 18);
  doc.setFont('helvetica', 'bold');
  doc.text(doc.splitTextToSize(merchantName || 'Não informado', 106)[0], 28, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Banco', 10, 25);
  doc.setFont('helvetica', 'bold');
  doc.text(doc.splitTextToSize(bank || 'Não informado', 106)[0], 28, 25);
};

const drawDetails = (doc: import('jspdf').jsPDF, data: PixPrintData, amountLabel: string) => {
const labelX = 79;
const valueX = 79;

  doc.setDrawColor(...BORDER);
  doc.setFillColor(...SURFACE);
  doc.roundedRect(71, 41, 67, 89, 3, 3, 'FD');

  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('VALOR', valueX, 52);

  doc.setTextColor(...ACCENT);
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(amountLabel, 56), valueX, 60);

  const rows: Array<[string, string]> = [
    ['NOME', data.name || 'Não informado'],
    ['BANCO', data.bank || 'Não informado'],
    ['CHAVE', data.key || 'Não informada'],
  ];

  let y = 73;
  for (const [label, value] of rows) {
    doc.setTextColor(...MUTED);
    doc.setFontSize(6.5);
    doc.text(label, labelX, y);
    doc.setTextColor(...PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(value, 52);
    doc.text(lines.slice(0, 2), valueX, y + 4);
    y += 15;
  }
};

const drawPayload = (doc: import('jspdf').jsPDF, payload: string) => {
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('PIX COPIA E COLA', 10, 141);

  doc.setFillColor(...SURFACE);
  doc.roundedRect(10, 144, 128, 29, 3, 3, 'FD');
  doc.setTextColor(...PRIMARY);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.2);
  const lines = doc.splitTextToSize(payload, 120);
  doc.text(lines.slice(0, 4), 14, 152);
};

export async function printPixSheet(data: PixPrintData): Promise<void> {
  const [{ jsPDF }, qrImage] = await Promise.all([
    import('jspdf'),
    generateHighResPng(data.payload, 8),
  ]);

  const amountLabel = formatAmount(data.amount);
  const generatedAt = formatGeneratedAt();
  const fileName = `pix-${sanitizeFilenamePart(data.name) || 'recebimento'}-${new Date().toISOString().slice(0, 10)}.pdf`;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210],
    compress: true,
  });

  doc.setProperties({
    title: 'Pagamento PIX',
    subject: 'QR Code e dados do PIX',
    creator: 'Minierp',
  });

  doc.setFillColor(...PAGE_BACKGROUND);
  doc.rect(0, 0, 148, 210, 'F');

  drawHeader(doc, data.name, data.bank);

  doc.setFillColor(...SURFACE);
  doc.roundedRect(10, 41, 54, 89, 3, 3, 'FD');
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('ESCANEIE PARA PAGAR', 15, 50);
  doc.addImage(qrImage, 'PNG', 14, 56, 46, 46);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(doc.splitTextToSize('Abra o app do seu banco e escolha "PIX".', 42), 15, 111);

  drawDetails(doc, data, amountLabel);
  drawPayload(doc, data.payload);

  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(`Gerado em ${generatedAt}`, 10, 188);
  doc.text('Confira os dados antes de confirmar o pagamento.', 10, 194);
  doc.setDrawColor(...BORDER);
  doc.line(10, 201, 138, 201);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('MINIERP · PAGAMENTO PIX', 10, 206);

  doc.autoPrint({ variant: 'non-conform' });
  const printWindow = doc.output('dataurlnewwindow', { filename: fileName });
  if (!printWindow) {
    doc.save(fileName);
  }
}
