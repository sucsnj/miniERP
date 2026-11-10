import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react';
import { fetchInvoicesByPeriod, deleteInvoice, InvoiceDetails } from '../../services/notasService';
import { formatCurrency } from '../../utils/formatter';
import { formatDateString, getCurrentYear } from '../../utils/date';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/common/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from '../../styles/monthNotes.module.css';

// Array com os months
const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface MonthNotesProps {
    year: number;
    month: number;
    setYear: (year: number) => void;
    setMonth: (month: number) => void;
}

const MonthNotes: React.FC<MonthNotesProps> = ({ year, month, setYear, setMonth }) => {
    const queryClient = useQueryClient();

    // estado para o diálogo
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Hook que busca notas automaticamente
    const { data: invoices = [], isLoading } = useQuery<InvoiceDetails[]>({
        queryKey: ['notas', year, month],
        queryFn: () => fetchInvoicesByPeriod(year, month).then((data) =>
            Array.isArray(data) ? data : [data]
        ),
    });

    // Somatório de notas
    const invoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.valor_nota, 0);

    const handleDelete = async (id: number) => {
        try {
            await deleteInvoice(id);
            // invalida cache e força refetch
            queryClient.invalidateQueries({ queryKey: ['notas', year, month] });
        } catch (error) {
            console.error('Erro ao excluir nota:', error);
        }
    };

    const openConfirm = (id: number) => {
        setSelectedId(id);
        setConfirmOpen(true);
    };

    return (
        <div className={`${styles.summaryCard} ${styles.small}`}>
            <h3>Notas do mês</h3>

            {/* Seletor de período */}
            <div className={`${styles.selectors}`}>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                    {months.map((name, index) => (
                        <option key={index} value={index + 1}>
                            {name}
                        </option>
                    ))}
                </select>

                <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {Array.from({ length: 5 }, (_, i) => getCurrentYear() - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <div>
                    <h4>Somatório</h4>
                    <span>R$ {formatCurrency(invoiceTotal, 2)}</span>
                </div>
            </div>

            {isLoading ? (
                <p>Carregando notas...</p>
            ) : invoices.length === 0 ? (
                <p>Nenhuma nota encontrada.</p>
            ) : (
                <table className={`${styles.summaryTable}`}>
                    <thead>
                        <tr>
                            <th>Emissão</th>
                            <th>Distribuidora</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((n) => (
                            <tr key={n.id}>
                                <td>{formatDateString(n.data_emissao, 'DD/MM/YYYY HH:mm')}</td>
                                <td>{n.distribuidora}</td>
                                <td>R$ {formatCurrency(Number(n.valor_nota), 2)}</td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => openConfirm(n.id)} leftIcon={<DeleteIcon />}>
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar exclusão"
                message="Tem certeza que deseja excluir esta nota?"
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => {
                    if (selectedId !== null) {
                        handleDelete(selectedId);
                    }
                    setConfirmOpen(false);
                }}
                onCancel={() => setConfirmOpen(false)}
            />
</div>
    );
};

export default MonthNotes;