import { useQuery } from '@tanstack/react-query'
import { useState } from 'react';
import { fetchInvoicesByPeriod, type InvoiceDetails } from '../../services/invoicesService';
import { tenantKeys, identityFromUser } from '../../utils/queryKeys';
import { useDeleteInvoice } from '../../hooks/usePayablesMutations';
import { formatCurrency } from '../../utils/formatter';
import { formatDateString, getCurrentYear } from '../../utils/date';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/common/Button';
import styles from '../../styles/monthNotes.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { usePendingTask } from '../../contexts/RouteLoadingContext';
import { LIVE_TENANT_QUERY_OPTIONS } from '../../utils/queryProfiles';

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
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const deleteInvoiceMutation = useDeleteInvoice();

    const identity = user ? identityFromUser(user) : null;
    const { data: invoices = [], isLoading } = useQuery<InvoiceDetails[]>({
        queryKey: identity
            ? tenantKeys.invoicesByMonth(identity, year, month)
            : ['invoices', 'disabled', year, month],
        enabled: Boolean(identity),
        queryFn: () => fetchInvoicesByPeriod(year, month),
        ...LIVE_TENANT_QUERY_OPTIONS,
    });

    usePendingTask('month-notes', isLoading);

    const invoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deleteAccounts, setDeleteAccounts] = useState(false);

    const groups = invoices.reduce<Record<string, InvoiceDetails[]>>((acc, inv) => {
        (acc[inv.supplierName] = acc[inv.supplierName] || []).push(inv);
        return acc;
    }, {});

    const toggle = (name: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const openConfirm = (id: string, withAccounts: boolean) => {
        setSelectedId(id);
        setDeleteAccounts(withAccounts);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (selectedId === null) return;
        try {
            await deleteInvoiceMutation.mutateAsync({ id: selectedId, deleteAccounts });
        } catch (error) {
            console.error('Erro ao excluir nota:', error);
        }
        setConfirmOpen(false);
        setSelectedId(null);
    };

    return (
        <div className={`${styles.summaryCard} ${styles.small}`}>
            <h3>Notas do mês</h3>

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

            {invoices.length === 0 ? (
                <p>Nenhuma nota encontrada.</p>
            ) : (
                <div>
                    {Object.entries(groups).map(([name, list]) => {
                        const total = list.reduce((s, n) => s + n.amount, 0);
                        const isExpanded = expanded.has(name);
                        return (
                            <div
                                key={name}
                                style={{ marginBottom: '8px', border: '1px solid var(--border, #ddd)', borderRadius: '6px', transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-soft)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                            >
                                <div
                                    onClick={() => toggle(name)}
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    <span>{name}</span>
                                    <span>R$ {formatCurrency(total, 2)} ({list.length})</span>
                                </div>
                                {isExpanded && (
                                    <table className={`${styles.summaryTable}`}>
                                        <thead>
                                            <tr>
                                                <th>Emissão</th>
                                                <th>Distribuidora</th>
                                                <th>Valor</th>
                                                {isAdmin && <th>Ações</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {list.map((n) => (
                                                <tr key={n.id}>
                                                    <td>{formatDateString(n.issueDate, 'DD/MM/YYYY HH:mm')}</td>
                                                    <td>{n.supplierName}</td>
                                                    <td>R$ {formatCurrency(Number(n.amount), 2)}</td>
                                                    {isAdmin && (
                                                        <td style={{ display: 'flex', gap: '4px' }}>
                                                            <Button variant="danger" size="sm" onClick={() => openConfirm(n.id, false)} style={{ fontSize: '0.75rem', padding: '2px 6px', width: 'auto', minWidth: 'fit-content' }}>
                                                                Excluir
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => openConfirm(n.id, true)} style={{ fontSize: '0.75rem', padding: '2px 6px', width: 'auto', minWidth: 'fit-content' }}>
                                                                + contas
                                                            </Button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar exclusão"
                message={deleteAccounts ? 'Excluir esta nota e as contas vinculadas a ela?' : 'Tem certeza que deseja excluir esta nota?'}
                confirmText={deleteAccounts ? 'Excluir nota e contas' : 'Excluir'}
                cancelText="Cancelar"
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default MonthNotes;
