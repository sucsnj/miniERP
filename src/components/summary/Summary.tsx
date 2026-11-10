import React, { useMemo } from 'react';
import styles from '../../styles/contas.module.css';
import Panel from '@/components/common/Panel';
import { AccountDetails } from '../../services/contasService';
import MonthlyConsolidation from './MonthlyConsolidation';
import TotalsByDistributor from './TotalsByDistributor';
import MonthNotes from './MonthNotes';
import { formatCurrency } from '../../utils/formatter';
import { parseDate } from '../../utils/date';
import summaryStyles from '../../styles/summary.module.css';

interface SummaryProps {
    accountsYear: AccountDetails[];
    year: number;
    month: number;
    setYear: (year: number) => void;
    setMonth: (month: number) => void;
}

const Summary: React.FC<SummaryProps> = ({ accountsYear, year, month, setYear, setMonth }) => {
    const summary = useMemo(() => {
        const paidTotal = accountsYear.filter((account) => account.status === 'Pago').reduce((sum, account) => sum + account.valor, 0);
        const pendingTotal = accountsYear.filter((account) => account.status === 'Pendente').reduce((sum, account) => sum + account.valor, 0);
        
        // Conta a quantidade pendente
        const pendingCount = accountsYear.filter((account) => account.status === 'Pendente').length;

        // Conta a quantidade de contas pagas
        const paidCount = accountsYear.filter((account) => account.status === 'Pago').length;

        // Conta o total de contas
        const totalCount = accountsYear.length;

        const totalsByDistributor = accountsYear.reduce<Record<string, number>>((acc, account) => {
            if (account.status === 'Pendente') {
                acc[account.distribuidora] = (acc[account.distribuidora] || 0) + account.valor;
            }
            
            return acc;
        }, {});

        const months = Array.from({ length: 12 }, (_, i) => {
            const monthIndex = i + 1;
            const accountsInMonth = accountsYear.filter((account) => parseDate(`${account.vencimento}T00:00:00`).month() + 1 === monthIndex);
            return {
                month: monthIndex,
                paid: accountsInMonth.filter((account) => account.status === 'Pago').reduce((sum, account) => sum + account.valor, 0),
                pending: accountsInMonth.filter((account) => account.status === 'Pendente').reduce((sum, account) => sum + account.valor, 0),
            };
        });

        return {
            paidTotal,
            pendingTotal,
            annualTotal: paidTotal + pendingTotal,
            months,
            totalsByDistributor,
            pendingCount,
            paidCount,
            totalCount,
        };
    }, [accountsYear]);

    return (
        <div>
            <Panel className={summaryStyles.summaryPanel}>
                <div className={styles.panelHeader}>
                    <h2>Resumo</h2>
                    <span className={styles.statusChip}>Atualização automática</span>
                </div>
                <div className={`${summaryStyles.summaryCard}`}>
                    <table>
                        <thead>
                            <tr>
                                <th><strong>Totais</strong></th>
                                <th><strong>Contadores</strong></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div>
                                        <div className={`${summaryStyles.summaryRow}`}>
                                            <strong>Pago</strong>
                                            <span>R$ {formatCurrency(summary.paidTotal, 2)}</span>
                                        </div>
                                        <div className={`${summaryStyles.summaryRow}`}>
                                            <strong>Pendente</strong>
                                            <span>R$ {formatCurrency(summary.pendingTotal, 2)}</span>
                                        </div>
                                        <div className={`${summaryStyles.summaryRow}`}>
                                            <strong>Acumulado anual</strong>
                                            <span>R$ {formatCurrency(summary.annualTotal, 2)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div className={`${summaryStyles.summaryRow}`}>
                                            <strong>Pago</strong>
                                            <span>{summary.paidCount}</span>
                                        </div>
                                        <div className={`${summaryStyles.summaryRow}`}>
                                            <strong>Pendente</strong>
                                            <span>{summary.pendingCount}</span>
                                        </div>
                                        <div className={`${summaryStyles.summaryRow}`}>
                                            <strong>Acumulado anual</strong>
                                            <span>{summary.totalCount}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                {/* #Totais por distribuidora */}
                <TotalsByDistributor totalsByDistributor={summary.totalsByDistributor} />

                { /* #Consolidação mensal */}
                <MonthlyConsolidation months={summary.months} />

                {/* #Notas do Mês */}
                <MonthNotes year={year} month={month} setYear={setYear} setMonth={setMonth} />

            </Panel>
</div>
    );
};

export default Summary;