import {
    CategoryData,
    BrandData,
    SupplierData
} from '../../services/produtosService';
import styles from '../../styles/produtos.module.css';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Form from '@/components/common/Form';
import Button from '@/components/common/Button';

export interface ProductFiltersState {
    search: string;
    type: 'PRODUTO' | 'SERVICO' | 'TODOS';
    categoryId: number | '';
    brandId: number | '';
    supplierId: number | '';
    status: 'ATIVO' | 'INATIVO' | 'TODOS';
}

export interface ProductFiltersData {
    categories: CategoryData[];
    brands: BrandData[];
    suppliers: SupplierData[];
}

export interface ProductFiltersActions {
    search: (e: React.FormEvent) => void;
    clear: () => void;
    changePage: (page: number) => void;
}

interface ProductFiltersProps {
    state: ProductFiltersState;
    data: ProductFiltersData;
    setFilters: React.Dispatch<React.SetStateAction<ProductFiltersState>>;
    actions: ProductFiltersActions;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
    state,
    data,
    setFilters,
    actions,
}) => {

    return (
        <Panel>
            <PanelHeader title="Filtros de Pesquisa" />
            <Form onSubmit={actions.search} className="page-actions">
                <label htmlFor="search-input" className={styles.filterLabelSearch}>
                    Buscar:
                    <input
                        id="search-input"
                        className={`${styles.filterInput} headerInput`}
                        type="text"
                        placeholder="Nome, código, EAN ou referência..."
                        value={state.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </label>

                <label htmlFor="filtro-tipo">
                    Tipo:
                    <select
                        id="filtro-tipo"
                        className={`${styles.filterSelect} headerSelect`}
                        value={state.type}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, type: e.target.value as 'PRODUTO' | 'SERVICO' | 'TODOS' }));
                            actions.changePage(1);
                        }}
                    >
                        <option value="TODOS">Todos</option>
                        <option value="PRODUTO">Produto</option>
                        <option value="SERVICO">Serviço</option>
                    </select>
                </label>

                <label htmlFor="filtro-categoria">
                    Categoria:
                    <select
                        id="filtro-categoria"
                        className={`${styles.filterSelect} headerSelect`}
                        value={state.categoryId}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : '' }));
                            actions.changePage(1);
                        }}>
                        <option value="">Todas</option>
                        {data.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>
                </label>

                <label htmlFor="filtro-marca">
                    Marca:
                    <select
                        id="filtro-marca"
                        className={`${styles.filterSelect} headerSelect`}
                        value={state.brandId}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, brandId: e.target.value ? Number(e.target.value) : '' }));
                            actions.changePage(1);
                        }}>
                        <option value="">Todas</option>
                        {data.brands.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nome}
                            </option>
                        ))}
                    </select>
                </label>

                <label htmlFor="filtro-fornecedor">
                    Fornecedor:
                    <select
                        id="filtro-fornecedor"
                        className={`${styles.filterSelect} headerSelect`}
                        value={state.supplierId}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, supplierId: e.target.value ? Number(e.target.value) : '' }));
                            actions.changePage(1);
                        }}>
                        <option value="">Todos</option>
                        {data.suppliers.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.nome}
                            </option>
                        ))}
                    </select>
                </label>

                <label htmlFor="filtro-status">
                    Status:
                    <select
                        id="filtro-status"
                        className={`${styles.filterSelect} headerSelect`}
                        value={state.status}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, status: e.target.value as 'ATIVO' | 'INATIVO' | 'TODOS' }));
                            actions.changePage(1);
                        }}
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="INATIVO">Inativos</option>
                    </select>
                </label>

                <div className={styles.filterActions}>
                    <Button type="submit" variant="primary">
                        Filtrar
                    </Button>
                    <Button type="button" variant="outline" onClick={actions.clear}>
                        Limpar
                    </Button>
                </div>
            </Form>
        </Panel>
    )
}

export default ProductFilters;