import styles from '../../styles/produtos.module.css';
import Panel from '@/components/common/Panel';
import Button from '@/components/common/Button';
import PanelHeader from '@/components/common/PanelHeader';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import { formatCurrency } from '../../utils/formatter';
import {
    ItemData,
} from '../../services/produtosService';

interface ProductListProps {
    items: ItemData[];
    loading: boolean;

    onEdit(item: ItemData): void;
    onDelete(item: ItemData): void;
    onToggleStatus(item: ItemData): void;

    total: number;
    page: number;
    totalPages: number;

    onPageChange(page: number): void;
}

const Listagem: React.FC<ProductListProps> = ({ items, total, page, totalPages, loading, onEdit, onDelete, onPageChange, onToggleStatus }) => {

    return (
        <div>
            <Panel>
                <PanelHeader title="Listagem" chip={<span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Total: {total} registro(s)</span>} />

                {loading ? (
                    <div className={styles.emptyState}>Carregando...</div>
                ) : items.length === 0 ? (
                    <div className={styles.emptyState}>Nenhum registro encontrado.</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Cód. Interno</th>
                                    <th className={styles.colNome}>Nome</th>
                                    <th>Preço Venda</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                    <th style={{ width: '100px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <span
                                                    className={`${styles.badge} ${item.tipo === 'PRODUTO'
                                                        ? styles.badgeProduto
                                                        : styles.badgeServico
                                                        }`}
                                                >
                                                    {item.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                                                </span>
                                            </td>
                                            <td>{item.codigo_interno || '—'}</td>
                                            <td>
                                                <strong>{item.nome}</strong>
                                                {item.descricao && (
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            color: 'var(--muted)',
                                                            marginTop: '2px',
                                                        }}
                                                    >
                                                        {item.descricao.length > 50
                                                            ? `${item.descricao.substring(0, 50)}...`
                                                            : item.descricao}
                                                    </div>
                                                )}
                                            </td>
                                            <td>R$ {formatCurrency(item.preco_venda || 0, 2)}</td>
                                            <td>
                                                {item.tipo === 'SERVICO' ? '—' : `${item.estoque_total ?? (item.estoque * (item.multiplicador_unidade ?? 1))} ${item.unidade_medida_sigla || ''}`.trim()}
                                            </td>

                                            <td>
                                                {item.tipo === 'PRODUTO' && (
                                                    <span
                                                        className={`${styles.badge} ${item.ativo === 1
                                                            ? styles.badgeAtivo
                                                            : styles.badgeInativo
                                                            }`}
                                                    >
                                                        {item.ativo === 1 ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    {item.tipo === 'PRODUTO' && (
                                                        <Button
                                                            type="button"
                                                            variant={item.ativo === 1 ? 'warning' : 'success'}
                                                            size="sm"
                                                            iconOnly
                                                            onClick={() => onToggleStatus(item)}
                                                            title={item.ativo === 1 ? 'Desativar' : 'Ativar'}
                                                            aria-label={item.ativo === 1 ? 'Desativar' : 'Ativar'}
                                                            id={`toggle-status-${item.id}`}
                                                            leftIcon={item.ativo === 1 ? <BlockIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                                                        />
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="info"
                                                        size="sm"
                                                        iconOnly
                                                        onClick={() => onEdit(item)}
                                                        title="Editar"
                                                        aria-label="Editar"
                                                        id={`edit-item-${item.id}`}
                                                        leftIcon={<EditIcon fontSize="small" />}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        iconOnly
                                                        onClick={() => onDelete(item)}
                                                        title="Excluir"
                                                        aria-label="Excluir"
                                                        id={`delete-item-${item.id}`}
                                                        leftIcon={<DeleteIcon fontSize="small" />}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className={styles.paginationRow}>
                        <div style={{ color: 'var(--muted)' }}>
                            Página {page} de {totalPages}
                        </div>
                        <div className={styles.paginationButtons}>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => onPageChange(page - 1)}
                            >
                                Anterior
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => onPageChange(page + 1)}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </Panel>
        </div>
    );
};

export default Listagem;