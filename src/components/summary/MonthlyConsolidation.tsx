import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../utils/formatter';
import { formatMonthName } from '../../utils/date';
import { capitalize } from '../../utils/captalize';
import { fetchAvailableYears } from '../../services/payablesService';
import { LIVE_TENANT_QUERY_OPTIONS } from '../../utils/queryProfiles';
import styles from '../../styles/monthlyConsolidation.module.css';
import { AccountDetails } from '../../services/payablesService';
import { parseDate } from '../../utils/date';

interface MonthlyConsolidationProps {
    accounts: AccountDetails[];
}

const MonthlyConsolidation: React.FC<MonthlyConsolidationProps> = ({ accounts }) => {
    const { data: availableYears = [] } = useQuery<number[]>({
        queryKey: ['payables', 'available-years'],
        queryFn: () => fetchAvailableYears(),
        ...LIVE_TENANT_QUERY_OPTIONS,
    });

    const years = availableYears.length > 0 ? availableYears : [new Date().getFullYear()];
    const [selectedYear, setSelectedYear] = useState<number>(years[0]);
    const effectiveYear = years.includes(selectedYear) ? selectedYear : years[0];

    const months = useMemo(() => {
        const filtered = accounts.filter((a) => {
            const y = parseInt(a.dueDate.slice(0, 4), 10);
            return y === effectiveYear;
        });
        return Array.from({ length: 12 }, (_, i) => {
            const monthIndex = i + 1;
            const accountsInMonth = filtered.filter((a) => {
                const d = parseDate(`${a.dueDate}T00:00:00`);
                return d.month() + 1 === monthIndex;
            });
            return {
                month: monthIndex,
                paid: accountsInMonth.filter((a) => a.status === 'Pago').reduce((s, a) => s + a.amount, 0),
                pending: accountsInMonth.filter((a) => a.status === 'Pendente').reduce((s, a) => s + a.amount, 0),
            };
        });
    }, [accounts, effectiveYear]);

    return (
        <div>
            <div className={`${styles.summaryCard} ${styles.small}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <h3>Consolidação mensal</h3>
                    <select value={effectiveYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <table className={`${styles.summaryTable}`}>
                    <thead>
                        <tr>
                            <th>Mês</th>
                            <th>Pago</th>
                            <th>Pendente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {months.map((m) => (
                            <tr key={m.month}>
                                <td>{capitalize(formatMonthName(m.month))}</td>
                                <td>R$ {formatCurrency(m.paid, 2)}</td>
                                <td>R$ {formatCurrency(m.pending, 2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlyConsolidation;