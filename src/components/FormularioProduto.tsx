import styles from '../styles/produtos.module.css';
import AddIcon from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { parseNumber } from '../utils/number';
import { formatCurrencyNumber } from '../utils/formatter';
import {
    CategoriaData,
    MarcaData,
    UnidadeMedidaData,
    FornecedorData
} from '../services/produtosService';

export interface ProdutoFormData {
    tipo: 'PRODUTO' | 'SERVICO';
    nome: string;
    descricao: string;
    categoriaId: number;
    marcaId: number;
    fornecedorId: number;
    precoCompra: string;
    margemLucro: string;
    precoVenda: string;
    estoque: string;
    multiplicadorUnidade: string;
    unidadeMedidaId: number;
    codigoInterno: string;
    referencia: string;
    duracaoMinutos: string;
    ativo: number;
    unidadesMedida: { unidadeMedidaId: number; multiplicadorUnidade: string; principal: boolean }[];
}

export interface ProdutoOptions {
    categorias: CategoriaData[];
    marcas: MarcaData[];
    fornecedores: FornecedorData[];
    unidadesMedida: UnidadeMedidaData[];
}

export interface ProdutoActions {
    abrirModalCategoria: () => void;
    abrirModalMarca: () => void;
    abrirModalFornecedor: () => void;
    abrirModalUnidadeMedida: () => void;
    abrirModalAjusteEstoque: () => void;
    editarCategoria: (categoria: CategoriaData) => void;
    editarMarca: (marca: MarcaData) => void;
    editarFornecedor: (fornecedor: FornecedorData) => void;
    editarUnidadeMedida: (unidadeMedida: UnidadeMedidaData) => void;
}

// Props do Componente
interface FormularioProdutoProps {
    editarProdutoId: number | null;
    form: ProdutoFormData;
    setForm: React.Dispatch<React.SetStateAction<ProdutoFormData>>;
    options: ProdutoOptions;
    actions: ProdutoActions;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

const FormularioProduto: React.FC<FormularioProdutoProps> = ({
    editarProdutoId,
    form,
    setForm,
    options,
    inputRef,
    actions,
}) => {
    return (
        <div className="CadastroEdicao">
            <div className={styles.formHeader}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-ativo">
                        Ativo:
                    </label>
                    <select
                        id="form-ativo"
                        className={styles.selectField}
                        value={form.ativo}
                        onChange={(e) => setForm(prev => ({ ...prev, ativo: Number(e.target.value) }))}
                    >
                        <option value={1}>Sim</option>
                        <option value={0}>Não</option>
                    </select>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-nome">
                    Nome:*
                </label>
                <input
                    id="form-nome"
                    ref={inputRef}
                    type="text"
                    className={styles.inputField}
                    placeholder="Nome do item"
                    value={form.nome}
                    onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-descricao">
                    Descrição:
                </label>
                <textarea
                    id="form-descricao"
                    className={styles.textareaField}
                    placeholder="Detalhes ou especificações"
                    rows={3}
                    value={form.descricao}
                    onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-categoria">
                    Categoria:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-categoria"
                        className={styles.selectField}
                        value={form.categoriaId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, categoriaId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                    >
                        {options.categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={actions.abrirModalCategoria}
                        title="Adicionar Categoria"
                        id="add-categoria-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de categorias */}
                    <button
                        type="button"
                        className={styles.manageButton}
                        onClick={() => {
                            const categoriaSelecionada = options.categorias.find(
                                (c) => c.id === form.categoriaId
                            );
                            if (categoriaSelecionada) {
                                actions.editarCategoria(categoriaSelecionada);
                            }
                        }}
                        title="Editar Categoria Selecionada"
                        id="edit-categoria-btn"
                    >
                        <MoreVert fontSize="small" />
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-marca">
                    Marca:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-marca"
                        className={styles.selectField}
                        value={form.marcaId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, marcaId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                    >
                        {options.marcas.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => actions.abrirModalMarca()}
                        title="Adicionar Marca"
                        id="add-marca-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de marcas*/}
                    <button
                        type="button"
                        className={styles.manageButton}
                        onClick={() => {
                            const marcaSelecionada = options.marcas.find(
                                (m) => m.id === form.marcaId
                            );
                            if (marcaSelecionada) {
                                actions.editarMarca(marcaSelecionada);
                            }
                        }}
                        title="Editar Marca Selecionada"
                        id="edit-marca-btn"
                    >
                        <MoreVert fontSize="small" />
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-fornecedor">
                    Fornecedor:
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        id="form-fornecedor"
                        className={styles.selectField}
                        value={form.fornecedorId}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, fornecedorId: e.target.value ? Number(e.target.value) : 1 }))
                        }
                    >
                        {options.fornecedores.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.nome}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={actions.abrirModalFornecedor}
                        title="Adicionar Fornecedor"
                        id="add-fornecedor-btn"
                    >
                        <AddIcon fontSize="small" />
                    </button>
                    {/* Botão dos 3 pontinhos para abrir modal de gerenciamento de fornecedores*/}
                    <button
                        type="button"
                        className={styles.manageButton}
                        onClick={() => {
                            const fornecedorSelecionado = options.fornecedores.find(
                                (f) => f.id === form.fornecedorId
                            );
                            if (fornecedorSelecionado) {
                                actions.editarFornecedor(fornecedorSelecionado);
                            }
                        }}
                        title="Editar Fornecedor Selecionado"
                        id="edit-fornecedor-btn"
                    >
                        <MoreVert fontSize="small" />
                    </button>
                </div>
            </div>

            <label className={styles.formLabel}>Preço, margem e estoque</label>
            <div className={styles.valoresGroup}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-preco-compra">
                        Compra:
                    </label>
                    <input
                        id="form-preco-compra"
                        type="text"
                        inputMode="decimal"
                        className={styles.inputField}
                        placeholder="0,00"
                        value={form.precoCompra}
                        onChange={(e) => {
                            const precoCompra = e.target.value;
                            const compraValor = parseNumber(precoCompra);
                            const vendaValor = parseNumber(form.precoVenda);
                            const margemValor = parseNumber(form.margemLucro);

                            if (!Number.isNaN(compraValor) && compraValor >= 0 && !Number.isNaN(margemValor)) {
                                const novoPrecoVenda = formatCurrencyNumber(compraValor * (1 + margemValor / 100), 2);
                                setForm(prev => ({ ...prev, precoCompra, precoVenda: String(novoPrecoVenda) }));
                                return;
                            }

                            if (!Number.isNaN(compraValor) && compraValor > 0 && !Number.isNaN(vendaValor)) {
                                const novaMargem = formatCurrencyNumber((vendaValor / compraValor - 1) * 100, 2);
                                setForm(prev => ({ ...prev, precoCompra, margemLucro: String(novaMargem) }));
                                return;
                            }

                            setForm(prev => ({ ...prev, precoCompra }));
                        }}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-margem-lucro">
                        Margem (%):
                    </label>
                    <input
                        id="form-margem-lucro"
                        type="text"
                        inputMode="decimal"
                        className={styles.inputField}
                        placeholder="0"
                        value={form.margemLucro}
                        onChange={(e) => {
                            const margemLucro = e.target.value;
                            const compraValor = parseNumber(form.precoCompra);
                            const margemValor = parseNumber(margemLucro);

                            if (!Number.isNaN(compraValor) && compraValor >= 0 && !Number.isNaN(margemValor)) {
                                const novoPrecoVenda = formatCurrencyNumber(compraValor * (1 + margemValor / 100), 2);
                                setForm(prev => ({ ...prev, margemLucro, precoVenda: String(novoPrecoVenda) }));
                                return;
                            }

                            setForm(prev => ({ ...prev, margemLucro }));
                        }}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-preco-venda">
                        Venda:
                    </label>
                    <input
                        id="form-preco-venda"
                        type="text"
                        inputMode="decimal"
                        className={styles.inputField}
                        placeholder="0,00"
                        value={form.precoVenda}
                        onChange={(e) => {
                            const precoVenda = e.target.value;
                            const compraValor = parseNumber(form.precoCompra);
                            const vendaValor = parseNumber(precoVenda);

                            if (!Number.isNaN(compraValor) && compraValor > 0 && !Number.isNaN(vendaValor)) {
                                const novaMargem = formatCurrencyNumber((vendaValor / compraValor - 1) * 100, 2);
                                setForm(prev => ({ ...prev, precoVenda, margemLucro: String(novaMargem) }));
                                return;
                            }

                            setForm(prev => ({ ...prev, precoVenda }));
                        }}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="form-estoque">
                        Estoque:
                    </label>
                    {editarProdutoId ? (
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={actions.abrirModalAjusteEstoque}
                            id="open-ajuste-estoque-btn"
                        >
                            Ajustar
                        </button>
                    ) : (
                        <input
                            id="form-estoque"
                            type="text"
                            inputMode="numeric"
                            className={styles.inputField}
                            placeholder="0"
                            value={form.estoque}
                            onChange={(e) => setForm(prev => ({ ...prev, estoque: e.target.value }))}
                        />
                    )}
                </div>

            </div>

            <div className={styles.formGroup} style={{ width: '100%', marginBottom: '1.5rem' }}>
                <label className={styles.formLabel}>
                    Unidades de Medida:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {form.unidadesMedida?.map((un, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                            <input
                                type="radio"
                                name="unidadePrincipal"
                                checked={un.principal}
                                onChange={() => {
                                    const newUm = [...form.unidadesMedida];
                                    newUm.forEach(u => u.principal = false);
                                    newUm[index].principal = true;
                                    setForm(prev => ({ ...prev, unidadesMedida: newUm, unidadeMedidaId: newUm[index].unidadeMedidaId, multiplicadorUnidade: newUm[index].multiplicadorUnidade }));
                                }}
                                title="Definir como Principal"
                                style={{ margin: '0 0.5rem' }}
                            />

                            <select
                                className={styles.selectField}
                                style={{ flex: 1 }}
                                value={un.unidadeMedidaId}
                                onChange={(e) => {
                                    const newUm = [...form.unidadesMedida];
                                    newUm[index].unidadeMedidaId = Number(e.target.value);
                                    if (un.principal) {
                                        setForm(prev => ({ ...prev, unidadesMedida: newUm, unidadeMedidaId: Number(e.target.value) }));
                                    } else {
                                        setForm(prev => ({ ...prev, unidadesMedida: newUm }));
                                    }
                                }}
                            >
                                {options.unidadesMedida.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.sigla} - {u.descricao}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                inputMode="decimal"
                                className={styles.inputField}
                                style={{ width: '100px' }}
                                placeholder="Fator"
                                value={un.multiplicadorUnidade}
                                onChange={(e) => {
                                    const newUm = [...form.unidadesMedida];
                                    newUm[index].multiplicadorUnidade = e.target.value;
                                    if (un.principal) {
                                        setForm(prev => ({ ...prev, unidadesMedida: newUm, multiplicadorUnidade: e.target.value }));
                                    } else {
                                        setForm(prev => ({ ...prev, unidadesMedida: newUm }));
                                    }
                                }}
                            />

                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => {
                                    const newUm = form.unidadesMedida.filter((_, i) => i !== index);
                                    if (un.principal && newUm.length > 0) {
                                        newUm[0].principal = true;
                                        setForm(prev => ({ ...prev, unidadesMedida: newUm, unidadeMedidaId: newUm[0].unidadeMedidaId, multiplicadorUnidade: newUm[0].multiplicadorUnidade }));
                                    } else {
                                        setForm(prev => ({ ...prev, unidadesMedida: newUm }));
                                    }
                                }}
                                title="Remover"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => {
                            const prev = form.unidadesMedida || [];
                            setForm(p => ({
                                ...p,
                                unidadesMedida: [...prev, { unidadeMedidaId: 1, multiplicadorUnidade: '1', principal: prev.length === 0 }]
                            }));
                        }}
                    >
                        + Nova Unidade
                    </button>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={actions.abrirModalUnidadeMedida}
                        title="Cadastrar Unidade no Sistema"
                    >
                        Cadastro de Unidades
                    </button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-cod-interno">
                    Código Interno:
                </label>
                <input
                    id="form-cod-interno"
                    type="text"
                    className={styles.inputField}
                    placeholder={editarProdutoId ? "Código Interno não pode ser alterado" : "Ex: PROD-001 (preenchido automaticamente caso deixado em branco)"}
                    value={form.codigoInterno}
                    onChange={(e) => setForm(prev => ({ ...prev, codigoInterno: e.target.value }))}
                    disabled={!!editarProdutoId}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="form-referencia">
                    Referência:
                </label>
                <input
                    id="form-referencia"
                    type="text"
                    className={styles.inputField}
                    placeholder="Ex: REF-001"
                    value={form.referencia}
                    onChange={(e) => setForm(prev => ({ ...prev, referencia: e.target.value }))}
                />
            </div>
        </div>
    )
};

export default FormularioProduto;