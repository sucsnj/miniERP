import styles from '../../styles/products.module.css';
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
} from '../../services/productsService';

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
                                                    className={`${styles.badge} ${item.kind === 'PRODUCT'
                                                        ? styles.badgeProduto
                                                        : styles.badgeServico
                                                        }`}
                                                >
                                                    {item.kind === 'PRODUCT' ? 'Produto' : 'Serviço'}
                                                </span>
                                            </td>
                                            <td>{item.internalCode || '—'}</td>
                                            <td>
                                                <strong>{item.name}</strong>
                                                {item.description && (
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            color: 'var(--muted)',
                                                            marginTop: '2px',
                                                        }}
                                                    >
                                                        {item.description.length > 50
                                                            ? `${item.description.substring(0, 50)}...`
                                                            : item.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td>R$ {formatCurrency(item.salePrice || 0, 2)}</td>
                                            <td>
                                                {item.kind === 'SERVICE' ? '—' : `${item.totalStock ?? (item.stock * (item.unit_multiplier ?? 1))} ${item.unitAbbreviation || ''}`.trim()}
                                            </td>

                                            <td>
                                                {item.kind === 'PRODUCT' && (
                                                    <span
                                                        className={`${styles.badge} ${item.active === 1
                                                            ? styles.activeBadge
                                                            : styles.inactiveBadge
                                                            }`}
                                                    >
                                                        {item.active === 1 ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    {item.kind === 'PRODUCT' && (
                                                        <Button
                                                            type="button"
                                                            variant={item.active === 1 ? 'warning' : 'success'}
                                                            size="sm"
                                                            iconOnly
                                                            onClick={() => onToggleStatus(item)}
                                                            title={item.active === 1 ? 'Desativar' : 'Ativar'}
                                                            aria-label={item.active === 1 ? 'Desativar' : 'Ativar'}
                                                            id={`toggle-status-${item.id}`}
                                                            leftIcon={item.active === 1 ? <BlockIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
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