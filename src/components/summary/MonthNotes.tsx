import { useQuery } from '@tanstack/react-query'
import { useState } from 'react';
import { fetchInvoicesByPeriod, type InvoiceDetails } from '../../services/invoicesService';
import { fetchAvailableYears } from '../../services/payablesService';
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

const MonthNotes: React.FC<MonthNotesProps> = ({ year: initialYear, month: initialMonth }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const deleteInvoiceMutation = useDeleteInvoice();

    const identity = user ? identityFromUser(user) : null;

    const { data: availableYears = [] } = useQuery<number[]>({
        queryKey: ['payables', 'available-years'],
        queryFn: () => fetchAvailableYears(),
        ...LIVE_TENANT_QUERY_OPTIONS,
    });
    const years = availableYears.length > 0 ? availableYears : [getCurrentYear()];

    const [selectedYear, setSelectedYear] = useState<number>(initialYear ?? years[0]);
    const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth ?? (new Date().getMonth() + 1));
    const effectiveYear = years.includes(selectedYear) ? selectedYear : years[0];

    const { data: invoices = [], isLoading } = useQuery<InvoiceDetails[]>({
        queryKey: identity
            ? tenantKeys.invoicesByMonth(identity, effectiveYear, selectedMonth)
            : ['invoices', 'disabled', effectiveYear, selectedMonth],
        enabled: Boolean(identity),
        queryFn: () => fetchInvoicesByPeriod(effectiveYear, selectedMonth),
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

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: 'fit-content' }}>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }}>
                        {months.map((name, index) => (
                            <option key={index} value={index + 1}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <select value={effectiveYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }}>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 4px' }}>Somatório</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>R$ {formatCurrency(invoiceTotal, 2)}</span>
                        <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#2563eb', color: '#ffffff' }}>
                            {invoices.length}
                        </span>
                    </div>
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
                            <div key={name} style={{ marginBottom: '8px', border: '1px solid var(--border, #ddd)', borderRadius: '6px', transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-soft)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                            >
                                <div
                                    onClick={() => toggle(name)}
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    <span>{name}</span>
                                    <span>R$ {formatCurrency(total, 2)}
                                        <span style={{ marginLeft: '6px', padding: '1px 7px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#2563eb', color: '#ffffff' }}>
                                            {list.length}
                                        </span>
                                    </span>
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