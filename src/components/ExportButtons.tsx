import { useRef, type ChangeEvent, type FC } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { registrarVendaComCriadoEm, VendaDiaria } from '../services/vendasService';
import parseNumber from '../utils/number';
import { parseDate } from '../utils/date';

interface ExportButtonsProps {
  sales: VendaDiaria[];
  mes: number;
  ano: number;
  selectedDate?: string;
  onMessage?: (message: string, type: 'success' | 'error' | 'info') => void;
  onImportCompleted?: () => void;
}

const ExportButtons: FC<ExportButtonsProps> = ({
  sales,
  mes,
  ano,
  selectedDate,
  onMessage,
  onImportCompleted,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        ? sales.filter((sale) => sale.data === selectedDate)
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
          ? `vendas-dia-${selectedDate}.xlsx`
          : `vendas-mes-${mes}-${ano}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      notify('Arquivo XLSX gerado com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      notify('Erro ao exportar XLSX.', 'error');
    }
  };

  // Função para disparar a importação.
  const triggerImport = (mode: 'day' | 'month') => {
    if (mode === 'day' && !selectedDate) {
      notify('Selecione um dia antes de importar por dia.', 'error');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.dataset.mode = mode;
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
    const mode = event.currentTarget.dataset.mode as 'day' | 'month';
    event.target.value = '';

    if (!file) return;

    try { // Pega o arquivo, importa o XLSX, cria a planilha, adiciona ao workbook, escreve o workbook e cria um blob.
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      if (rows.length === 0) {
        notify('Arquivo XLSX sem dados.', 'error');
        return;
      }

      const parsedItems: Array<{ data: string; valor: number; observacoes?: string, criado_em?: string }> = [];
      const errors: string[] = [];

      rows.forEach((row, index) => {
        const normalizedRow: Record<string, unknown> = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[normalizeHeader(key)] = row[key];
        });

        let dataValue = String(
          normalizedRow['data'] ||
          normalizedRow['date'] ||
          normalizedRow['dia'] ||
          ''
        ).trim();

        const valorValue =
          normalizedRow['valor'] || normalizedRow['value'] || normalizedRow['amount'];
        const observacoesValue =
          normalizedRow['observacoes'] ||
          normalizedRow['observações'] ||
          normalizedRow['obs'] ||
          '';

        const criadoEmValue =
          normalizedRow['criado_em'] ||
          normalizedRow['created_at'] ||
          '';

        // Se não houver data
        if (!dataValue) {
          if (mode === 'day') {
            dataValue = selectedDate ?? '';
          } else {
            errors.push(`Linha ${index + 1}: data ausente.`);
            return;
          }
        }

        // Validação por modo
        if (mode === 'day' && selectedDate && dataValue !== selectedDate) {
          errors.push(
            `Linha ${index + 1}: a data deve ser igual ao dia selecionado (${selectedDate}).`
          );
          return;
        }

        if (mode === 'month' && !dateMatchesMonth(dataValue)) {
          errors.push(
            `Linha ${index + 1}: a data deve pertencer ao mês ${mes}/${ano}.`
          );
          return;
        }

        const valor = formatValue(valorValue);
        if (Number.isNaN(valor)) {
          errors.push(`Linha ${index + 1}: valor inválido.`);
          return;
        }

        parsedItems.push({
          data: dataValue,
          valor,
          observacoes: String(observacoesValue).trim() || undefined,
          criado_em: String(criadoEmValue).trim() || undefined,
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
          registrarVendaComCriadoEm(item.data, item.valor, item.observacoes, item.criado_em)
        )
      );

      notify(`Importação concluída com ${parsedItems.length} registro(s).`, 'success');
      onImportCompleted?.();
    } catch (error) {
      console.error('Erro ao importar XLSX:', error);
      notify('Erro ao importar XLSX.', 'error');
    }
  };

  // Formata o valor.
  const formatValue = (value: unknown) => {
    return parseNumber(value);
  };

  // Verifica se a data pertence ao mês.
  const dateMatchesMonth = (dateValue: string) => {
    const parsed = parseDate(`${dateValue}T00:00:00`);
    return (
      !Number.isNaN(parsed.valueOf()) &&
      parsed.month() + 1 === mes &&
      parsed.year() === ano
    );
  };

  // Exporta vendas para PDF.
  const exportPDF = async () => {
    const element = document.querySelector('.table-container') as HTMLElement;
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`vendas-${mes}-${ano}.pdf`);
    }
  };

  return (
    <div className="glass-form"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <button type="button" onClick={() => exportXLSX('month')}>
        Exportar XLSX (Mês)
      </button>
      <button type="button" onClick={() => exportXLSX('day')} disabled={!selectedDate}>
        Exportar XLSX (Dia)
      </button>
      <button type="button" onClick={() => triggerImport('month')}>
        Importar XLSX (Mês)
      </button>
      <button type="button" onClick={() => triggerImport('day')} disabled={!selectedDate}>
        Importar XLSX (Dia)
      </button>
      <button type="button" onClick={exportPDF}>
        Exportar PDF
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        data-mode="month"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ExportButtons;
