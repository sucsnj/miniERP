import React from 'react';
import { formatCurrency } from '../../utils/formatter';
import { formatMonthName } from '../../utils/date';
import { capitalize } from '../../utils/captalize';
import styles from '../../styles/monthlyConsolidation.module.css';

interface MonthlyConsolidationProps {
    months: { month: number; paid: number; pending: number }[];
}

const MonthlyConsolidation: React.FC<MonthlyConsolidationProps> = ({ months }) => {
    return (
        <div>
            <div className={`${styles.summaryCard} ${styles.small}`}>
                <h3>Consolidação mensal</h3>
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