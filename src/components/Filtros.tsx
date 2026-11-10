import {
    CategoriaData,
    MarcaData,
    FornecedorData
} from '../services/produtosService';
import styles from '../styles/produtos.module.css';

export interface FiltrosState {
    search: string;
    tipo: 'PRODUTO' | 'SERVICO' | 'TODOS';
    categoriaId: number | '';
    marcaId: number | '';
    fornecedorId: number | '';
    status: 'ATIVO' | 'INATIVO' | 'TODOS';
}

export interface FiltrosData {
    categorias: CategoriaData[];
    marcas: MarcaData[];
    fornecedores: FornecedorData[];
}

export interface FiltrosActions {
    buscar: (e: React.FormEvent) => void;
    limpar: () => void;
    mudarPagina: (page: number) => void;
}

interface FiltrosProps {
    state: FiltrosState;
    data: FiltrosData;
    setFiltros: React.Dispatch<React.SetStateAction<FiltrosState>>;
    actions: FiltrosActions;
}

const Filtros: React.FC<FiltrosProps> = ({
    state,
    data,
    setFiltros,
    actions,
}) => {

    return (
        <section className="glass-form" aria-labelledby="filtros-title">
            <h2 id="filtros-title" className="">Filtros de Pesquisa</h2>
            <form onSubmit={actions.buscar} className={`${styles.filterForm} page-actions`}>
                <label htmlFor="search-input" className={styles.filterLabelSearch}>
                    Buscar:
                    <input
                        id="search-input"
                        className={`${styles.filterInput} headerInput`}
                        type="text"
                        placeholder="Nome, código, EAN ou referência..."
                        value={state.search}
                        onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
                    />
                </label>

                <label htmlFor="filtro-tipo">
                    Tipo:
                    <select
                        id="filtro-tipo"
                        className={`${styles.filterSelect} headerSelect`}
                        value={state.tipo}
                        onChange={(e) => {
                            setFiltros(prev => ({ ...prev, tipo: e.target.value as 'PRODUTO' | 'SERVICO' | 'TODOS' }));
                            actions.mudarPagina(1);
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
                        value={state.categoriaId}
                        onChange={(e) => {
                            setFiltros(prev => ({ ...prev, categoriaId: e.target.value ? Number(e.target.value) : '' }));
                            actions.mudarPagina(1);
                        }}>
                        <option value="">Todas</option>
                        {data.categorias.map((c) => (
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
                        value={state.marcaId}
                        onChange={(e) => {
                            setFiltros(prev => ({ ...prev, marcaId: e.target.value ? Number(e.target.value) : '' }));
                            actions.mudarPagina(1);
                        }}>
                        <option value="">Todas</option>
                        {data.marcas.map((m) => (
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
                        value={state.fornecedorId}
                        onChange={(e) => {
                            setFiltros(prev => ({ ...prev, fornecedorId: e.target.value ? Number(e.target.value) : '' }));
                            actions.mudarPagina(1);
                        }}>
                        <option value="">Todos</option>
                        {data.fornecedores.map((f) => (
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
                            setFiltros(prev => ({ ...prev, status: e.target.value as 'ATIVO' | 'INATIVO' | 'TODOS' }));
                            actions.mudarPagina(1);
                        }}
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="INATIVO">Inativos</option>
                    </select>
                </label>

                <div className={styles.filterActions}>
                    <button type="submit" className="headerBackupButton">
                        Filtrar
                    </button>
                    <button
                        type="button"
                        className="headerButton"
                        onClick={actions.limpar}
                    >
                        Limpar
                    </button>
                </div>
            </form>
        </section>
    )
}

export default Filtros;