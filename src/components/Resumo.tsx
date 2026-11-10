import React, { useMemo } from 'react';
import styles from '../styles/contas.module.css';
import { ContaDetalhe } from '../services/contasService';
import ConsolidacaoMensal from './ConsolidacaoMensal';
import TotaisPorDistribuidora from './TotaisPorDistribuidora';
import NotasDoMes from './NotasDoMes';
import { formatCurrency } from '../utils/formatter';
import { parseDate } from '../utils/date';

interface ResumoProps {
    contasAno: ContaDetalhe[];
    ano: number;
    mes: number;
    setAno: (ano: number) => void;
    setMes: (mes: number) => void;
}

const Resumo: React.FC<ResumoProps> = ({ contasAno, ano, mes, setAno, setMes }) => {
    const resumo = useMemo(() => {
        const totalPago = contasAno.filter((conta) => conta.status === 'Pago').reduce((sum, conta) => sum + conta.valor, 0);
        const totalPendente = contasAno.filter((conta) => conta.status === 'Pendente').reduce((sum, conta) => sum + conta.valor, 0);
        
        // Conta a quantidade pendente
        const qtdPendente = contasAno.filter((conta) => conta.status === 'Pendente').length;

        // Conta a quantidade de contas pagas
        const qtdPago = contasAno.filter((conta) => conta.status === 'Pago').length;

        // Conta o total de contas
        const qtdTotal = contasAno.length;

        const totaisPorDistribuidora = contasAno.reduce<Record<string, number>>((acc, conta) => {
            if (conta.status === 'Pendente') {
                acc[conta.distribuidora] = (acc[conta.distribuidora] || 0) + conta.valor;
            }
            
            return acc;
        }, {});

        const meses = Array.from({ length: 12 }, (_, i) => {
            const monthIndex = i + 1;
            const contasNoMes = contasAno.filter((conta) => parseDate(`${conta.vencimento}T00:00:00`).month() + 1 === monthIndex);
            return {
                mes: monthIndex,
                pago: contasNoMes.filter((conta) => conta.status === 'Pago').reduce((sum, conta) => sum + conta.valor, 0),
                pendente: contasNoMes.filter((conta) => conta.status === 'Pendente').reduce((sum, conta) => sum + conta.valor, 0),
            };
        });

        return {
            totalPago,
            totalPendente,
            totalAnual: totalPago + totalPendente,
            meses,
            totaisPorDistribuidora,
            qtdPendente,
            qtdPago,
            qtdTotal,
        };
    }, [contasAno]);

    return (
        <div>
            <section className={`${styles.contasPanel} resumo-panel`}>
                <div className={styles.panelHeader}>
                    <h2>Resumo</h2>
                    <span className={styles.statusChip}>Atualização automática</span>
                </div>
                <div className="summary-card">
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
                                        <div className="summary-row">
                                            <strong>Pago</strong>
                                            <span>R$ {formatCurrency(resumo.totalPago, 2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Pendente</strong>
                                            <span>R$ {formatCurrency(resumo.totalPendente, 2)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Acumulado anual</strong>
                                            <span>R$ {formatCurrency(resumo.totalAnual, 2)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div className="summary-row">
                                            <strong>Pago</strong>
                                            <span>{resumo.qtdPago}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Pendente</strong>
                                            <span>{resumo.qtdPendente}</span>
                                        </div>
                                        <div className="summary-row">
                                            <strong>Acumulado anual</strong>
                                            <span>{resumo.qtdTotal}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                {/* #Totais por distribuidora */}
                <TotaisPorDistribuidora totaisPorDistribuidora={resumo.totaisPorDistribuidora} />

                { /* #Consolidação mensal */}
                <ConsolidacaoMensal meses={resumo.meses} />

                {/* #Notas do Mês */}
                <NotasDoMes ano={ano} mes={mes} setAno={setAno} setMes={setMes} />

            </section>
            <style jsx>{`
                .contas-panel {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 22px;
                    box-shadow: var(--shadow);
                }

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

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 18px;
                }

                .panel-header h2 {
                    margin: 0;
                    font-size: 1.4rem;
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

                .summary-card {
                    background: var(--surface-strong);
                    border: 1px solid var(--border);
                    border-radius: 22px;
                    padding: 20px;
                    min-height: 220px;
                }

                .summary-row:last-child {
                  border-bottom: none;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 0;
                    border-bottom: 1px solid var(--border);
                }

            `}</style>
        </div>
    );
};

export default Resumo;
