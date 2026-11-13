import { useRef, type ChangeEvent, type FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { registerSaleWithCreatedAt, DailySale } from '../../services/salesService';
import parseNumber from '../../utils/number';
import dayjs from 'dayjs';
import Button from '@/components/common/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Panel from '@/components/common/Panel';
import { useAuth } from '../../contexts/AuthContext';
import { tenantQueryRoot, identityFromUser } from '../../utils/queryKeys';

interface ExportButtonsProps {
  sales: DailySale[];
  month: number;
  year: number;
  selectedDate?: string;
  onMessage?: (message: string, type: 'success' | 'error' | 'info') => void;
  onImportCompleted?: () => void;
}

const parseDateCell = (value: unknown): string | null => {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return dayjs(value).format('YYYY-MM-DD');
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const timestamp = Math.round((value - 25569) * 86400 * 1000);
    const date = dayjs(timestamp);
    return date.isValid() ? date.format('YYYY-MM-DD') : null;
  }

  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const direct = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? dayjs(raw, 'YYYY-MM-DD', true) : null;
  if (direct?.isValid()) return direct.format('YYYY-MM-DD');

  const brazilian = dayjs(raw, 'DD/MM/YYYY', true);
  if (brazilian.isValid()) return brazilian.format('YYYY-MM-DD');

  const iso = dayjs(raw);
  return iso.isValid() ? iso.format('YYYY-MM-DD') : null;
};

const ExportButtons: FC<ExportButtonsProps> = ({
  sales,
  month,
  year,
  selectedDate,
  onMessage,
  onImportCompleted,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const identity = user ? identityFromUser(user) : null;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storeSlug = (user?.storeName ?? 'loja').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'loja';

  // Função para notificar mensagens.
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    onMessage?.(message, type);
  };

  // Função para exportar vendas para XLSX.
  const exportXLSX = async (mode: 'day' | 'month') => {
    if (mode === 'day' && !selectedDate) {
      notify('Selecione um dia antes de exportar por dia.', 'error');
      return;
    }

    const dataToExport =
      mode === 'day'
        ? sales.filter((sale) => sale.date === selectedDate)
        : sales;

    if (dataToExport.length === 0) {
      notify(
        mode === 'day'
          ? 'Nenhuma venda encontrada para exportar no dia selecionado.'
          : 'Nenhuma venda encontrada para exportar neste mês.',
        'error'
      );
      return;
    }

    try { // Importa, cria a planilha, adiciona ao workbook, escreve o workbook e cria um blob.
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        mode === 'day'
          ? `vendas-${storeSlug}-dia-${selectedDate}.xlsx`
          : `vendas-${storeSlug}-mes-${month}-${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      notify('Arquivo XLSX gerado com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      notify('Erro ao exportar XLSX.', 'error');
    }
  };

  // Função para disparar a importação.
  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Função para normalizar o header.
  const normalizeHeader = (header: string) =>
    header
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD") // remove acentos
      .replace(/[\u0300-\u036f]/g, "");

  // Função para manipular a mudança do arquivo.
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try { // Pega o arquivo, importa o XLSX, cria a planilha, adiciona ao workbook, escreve o workbook e cria um blob.
      const date = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(date, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      if (rows.length === 0) {
        notify('Arquivo XLSX sem dados.', 'error');
        return;
      }

      const parsedItems: Array<{ date: string; amount: number; notes?: string, createdAt?: string }> = [];
      const errors: string[] = [];

      rows.forEach((row, index) => {
        const normalizedRow: Record<string, unknown> = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[normalizeHeader(key)] = row[key];
        });

        const dataValue = parseDateCell(
          normalizedRow['data'] ||
          normalizedRow['date'] ||
          normalizedRow['dia'] ||
          ''
        ) ?? '';

        const amountValue =
          normalizedRow['valor'] || normalizedRow['value'] || normalizedRow['amount'];
        const notesValue =
          normalizedRow['observacoes'] ||
          normalizedRow['observações'] ||
          normalizedRow['obs'] ||
          '';

        const createdAtValue =
          normalizedRow['criado_em'] ||
          normalizedRow['created_at'] ||
          '';

        if (!dataValue) {
          errors.push(`Linha ${index + 1}: data inválida ou ausente.`);
          return;
        }

        const amount = formatValue(amountValue);
        if (Number.isNaN(amount)) {
          errors.push(`Linha ${index + 1}: valor inválido.`);
          return;
        }

        parsedItems.push({
          date: dataValue,
          amount: amount,
          notes: String(notesValue).trim() || undefined,
          createdAt: String(createdAtValue).trim() || undefined,
        });
      });

      if (errors.length > 0) {
        notify(errors[0], 'error');
        return;
      }

      if (parsedItems.length === 0) {
        notify('Não há linhas válidas para importar.', 'error');
        return;
      }

      await Promise.all(
        parsedItems.map((item) =>
          registerSaleWithCreatedAt(item.date, item.amount, item.notes, item.createdAt)
        )
      );

      if (identity) {
        await queryClient.invalidateQueries({ queryKey: tenantQueryRoot(identity), refetchType: 'all' });
      }

      notify(`Importação concluída com ${parsedItems.length} registro(s).`, 'success');
      onImportCompleted?.();
    } catch (error) {
      console.error('Erro ao importar XLSX:', error);
      notify('Erro ao importar XLSX.', 'error');
    }
  };

  // Formata o amount.
  const formatValue = (value: unknown) => {
    return parseNumber(value);
  };

  return (
    <Panel style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
      <Button type="button" variant="info" onClick={() => exportXLSX('month')} leftIcon={<FileDownloadIcon />}>
        Exportar XLSX (Mês)
      </Button>
      <Button type="button" variant="info" onClick={() => exportXLSX('day')} disabled={!selectedDate} leftIcon={<FileDownloadIcon />}>
        Exportar XLSX (Dia)
      </Button>
      <Button type="button" variant="secondary" onClick={() => triggerImport()} leftIcon={<FileUploadIcon />}>
        Importar XLSX
      </Button>
      <Button type="button" variant="secondary" onClick={() => triggerImport()} disabled={!selectedDate} leftIcon={<FileUploadIcon />}>
        Importar XLSX (Dia)
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
    </Panel>
  );
};

export default ExportButtons;
