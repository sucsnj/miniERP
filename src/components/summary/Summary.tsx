import React, { useMemo } from 'react';
import styles from '../../styles/payables.module.css';
import Panel from '@/components/common/Panel';
import { AccountDetails } from '../../services/payablesService';
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
        const paidTotal = accountsYear.filter((account) => account.status === 'Pago').reduce((sum, account) => sum + account.amount, 0);
        const pendingTotal = accountsYear.filter((account) => account.status === 'Pendente').reduce((sum, account) => sum + account.amount, 0);
        
        // Conta a quantity pendente
        const pendingCount = accountsYear.filter((account) => account.status === 'Pendente').length;

        // Conta a quantity de contas pagas
        const paidCount = accountsYear.filter((account) => account.status === 'Pago').length;

        // Conta o total de contas
        const totalCount = accountsYear.length;

        const totalsByDistributor = accountsYear.reduce<Record<string, { amount: number; count: number }>>((acc, account) => {
            if (account.status === 'Pendente') {
                if (!acc[account.supplierName]) {
                    acc[account.supplierName] = { amount: 0, count: 0 };
                }
                acc[account.supplierName].amount += account.amount;
                acc[account.supplierName].count += 1;
            }

            return acc;
        }, {});

        const months = Array.from({ length: 12 }, (_, i) => {
            const monthIndex = i + 1;
            const accountsInMonth = accountsYear.filter((account) => parseDate(`${account.dueDate}T00:00:00`).month() + 1 === monthIndex);
            return {
                month: monthIndex,
                paid: accountsInMonth.filter((account) => account.status === 'Pago').reduce((sum, account) => sum + account.amount, 0),
                pending: accountsInMonth.filter((account) => account.status === 'Pendente').reduce((sum, account) => sum + account.amount, 0),
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'stretch' }}>
                <div className={`${summaryStyles.summaryCard}`} style={{ flex: '1 1 320px', minWidth: '280px' }}>
                    <h3 style={{ margin: '0 0 8px' }}>Totais e contadores</h3>
                    <div style={{ overflowX: 'auto' }}>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <div className={`${summaryStyles.summaryRow}`}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <strong>Pago</strong>
                                            <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#2563eb', color: '#ffffff' }}>
                                                {summary.paidCount}
                                            </span>
                                        </span>
                                    </div>
                                    <div className={`${summaryStyles.summaryRow}`}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <strong>Pendente</strong>
                                            <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#2563eb', color: '#ffffff' }}>
                                                {summary.pendingCount}
                                            </span>
                                        </span>
                                    </div>
                                    <div className={`${summaryStyles.summaryRow}`}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <strong>Acumulado anual</strong>
                                            <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#2563eb', color: '#ffffff' }}>
                                                {summary.totalCount}
                                            </span>
                                        </span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                    <div className={`${summaryStyles.summaryRow}`}>
                                        <span>R$ {formatCurrency(summary.paidTotal, 2)}</span>
                                    </div>
                                    <div className={`${summaryStyles.summaryRow}`}>
                                        <span>R$ {formatCurrency(summary.pendingTotal, 2)}</span>
                                    </div>
                                    <div className={`${summaryStyles.summaryRow}`}>
                                        <span>R$ {formatCurrency(summary.annualTotal, 2)}</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </div>

                </div>
                <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
                {/* #Totais por supplierName */}
                <TotalsByDistributor totalsByDistributor={summary.totalsByDistributor} />
                </div>
                </div>

                { /* #Consolidação mensal */}
                <MonthlyConsolidation accounts={accountsYear} />

                {/* #Notas do Mês */}
                <MonthNotes year={year} month={month} setYear={setYear} setMonth={setMonth} />

            </Panel>
</div>
    );
};

export default Summary;