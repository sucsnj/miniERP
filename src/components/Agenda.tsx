import React, { useMemo } from 'react';
import OcrUpload from '@/components/OcrUpload';
import { ContaDetalhe, } from '../services/contasService';
import { formatCurrency } from '../utils/formatter';
import styles from '../styles/contas.module.css';
import { formatDateString } from '../utils/date';
import { toTimestamp } from '../utils/date';

interface AgendaProps {
    contasMes: ContaDetalhe[];
    contasAno: ContaDetalhe[];
}

const Agenda: React.FC<AgendaProps> = ({ contasAno }) => {
    // Mapeamento de contas por data de vencimento
    const agenda = useMemo(() => {
        const map = new Map<string, { data: string; totalPendente: number }>();
        contasAno.forEach((conta) => {
            const current = map.get(conta.vencimento) ?? { data: conta.vencimento, totalPendente: 0 };
            if (conta.status === 'Pendente') {
                current.totalPendente += conta.valor;
            }
            map.set(conta.vencimento, current);
        });
        return Array.from(map.values())
            .filter((item) => item.totalPendente > 0)
            .sort((a, b) => toTimestamp(a.data) - toTimestamp(b.data))
            .slice(0, 8);
    }, [contasAno]);

    // Lista de contas pendentes que serão pagas na próxima semana
    const proximasContas = useMemo(() => {
        return contasAno
            .filter((conta) => conta.status === 'Pendente')
            .sort((a, b) => toTimestamp(a.vencimento) - toTimestamp(b.vencimento))
            .slice(0, 12); // Quantidade de contas a serem exibidas (12)
    }, [contasAno]);

    return (
        <div>
            <section className={`${styles.contasPanel} ${styles.agendaPanel}`}>
                <div className={styles.panelHeader}>
                    <h2>Agenda</h2>
                    <span className={styles.statusChip}>Atualização automática</span>
                </div>
                <div className="agenda-card">
                    <h3>Total pendente por vencimento</h3>
                    <div className="agenda-list">
                        {agenda.length === 0 ? (
                            <p>Nenhum vencimento registrado neste mês.</p>
                        ) : (
                            agenda.map((item) => (
                                <div key={item.data} className="agenda-row">
                                    <strong>{formatDateString(item.data, 'DD-MM-YYYY')}</strong>
                                    <span>R$ {formatCurrency(item.totalPendente, 2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <section className={`${styles.contasPanel} ${styles.proximasPanel}`}>
                    <div className={styles.panelHeader}>
                        <h3>Próximas contas</h3>
                    </div>
                    <div className="proximas-list">
                        {proximasContas.length === 0 ? (
                            <p>Nenhuma conta pendente encontrada.</p>
                        ) : (
                            proximasContas.map((conta) => (
                                <div key={conta.id} className="proxima-row">
                                    <strong>{formatDateString(conta.vencimento, 'DD-MM-YYYY')}</strong> - {conta.distribuidora} - <span>R$ {formatCurrency(conta.valor, 2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className={styles.contasPanel}>
                    <div className={styles.panelHeader}>
                        <h3>Leitura de Contas</h3>
                    </div>
                    <div className="ocr-upload-wrapper">
                        <OcrUpload />
                    </div>
                </section>
            </section>

            <style jsx>{`
                .contas-panel {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 22px;
                    box-shadow: var(--shadow);
                }

                .agenda-panel,
                    .resumo-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 18px;
                }

                .status-chip {
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: var(--surface-soft);
                    color: var(--muted);
                    font-size: 0.9rem;
                    white-space: normal;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    max-width: 100%;
                }

                .agenda-card,
                .summary-card {
                    background: var(--surface-strong);
                    border: 1px solid var(--border);
                    border-radius: 22px;
                    padding: 20px;
                    margin-bottom: 15px;
                    min-height: 220px;
                }

                .agenda-list {
                    display: grid;
                    gap: 14px;
                }

                .agenda-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    border-radius: 10px;
                    background: var(--surface-soft);
                }

                .contas-panel {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 22px;
                    box-shadow: var(--shadow);
                }

            `}</style>
        </div>
    );
};

export default Agenda;
