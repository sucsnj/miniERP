import React, { useMemo } from 'react';
import OcrUpload from '@/components/import/OcrUpload';
import { useAuth } from '@/contexts/AuthContext';
import { AccountDetails, } from '../../services/payablesService';
import { formatCurrency } from '../../utils/formatter';
import styles from '../../styles/payables.module.css';
import Panel from '@/components/common/Panel';
import { formatDateString } from '../../utils/date';
import { toTimestamp } from '../../utils/date';

interface AgendaProps {
    accountsMonth: AccountDetails[];
    accountsYear: AccountDetails[];
}

const Agenda: React.FC<AgendaProps> = ({ accountsYear }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    // Mapeamento de contas por date de dueDate
    const agenda = useMemo(() => {
        const map = new Map<string, { date: string; pendingTotal: number }>();
        accountsYear.forEach((account) => {
            const current = map.get(account.dueDate) ?? { date: account.dueDate, pendingTotal: 0 };
            if (account.status === 'Pendente') {
                current.pendingTotal += account.amount;
            }
            map.set(account.dueDate, current);
        });
        return Array.from(map.values())
            .filter((item) => item.pendingTotal > 0)
            .sort((a, b) => toTimestamp(a.date) - toTimestamp(b.date))
            .slice(0, 8);
    }, [accountsYear]);

    // Lista de contas pendentes que serão pagas na próxima semana
    const upcomingAccounts = useMemo(() => {
        return accountsYear
            .filter((account) => account.status === 'Pendente')
            .sort((a, b) => toTimestamp(a.dueDate) - toTimestamp(b.dueDate))
            .slice(0, 12); // Quantidade de contas a serem exibidas (12)
    }, [accountsYear]);

    return (
        <div>
            <Panel className={styles.agendaPanel}>
                <div className={styles.panelHeader}>
                    <h2>Agenda</h2>
                    <span className={styles.statusChip}>Atualização automática</span>
                </div>
                <div className={styles.agendaCard}>
                    <h3>Total pendente por vencimento</h3>
                    <div className={styles.agendaList}>
                        {agenda.length === 0 ? (
                            <p>Nenhum valor registrado neste mês.</p>
                        ) : (
                            agenda.map((item) => (
                                <div key={item.date} className={styles.agendaRow}>
                                    <strong>{formatDateString(item.date, 'DD-MM-YYYY')}</strong>
                                    <span>R$ {formatCurrency(item.pendingTotal, 2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <Panel>
                    <div className={styles.panelHeader}>
                        <h3>Próximas contas</h3>
                    </div>
                    <div>
                        {upcomingAccounts.length === 0 ? (
                            <p>Nenhuma conta pendente encontrada.</p>
                        ) : (
                            upcomingAccounts.map((account) => (
                                <div key={account.id}>
                                    <strong>{formatDateString(account.dueDate, 'DD-MM-YYYY')}</strong> - {account.supplierName} - <span>R$ {formatCurrency(account.amount, 2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Panel>

                <Panel>
                    <div className={styles.panelHeader}>
                        <h3>Leitura de Contas</h3>
                    </div>
                    {isAdmin && <OcrUpload />}
                    {!isAdmin && <p>Leitura de contas disponível apenas para administradores.</p>}
                </Panel>
            </Panel>
        </div>
    );
};

export default Agenda;
