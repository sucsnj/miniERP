import { useRef, useState, useCallback, useEffect } from 'react';
import { useFocusTrap } from '../utils/focus';
import styles from '../styles/produtos.module.css';
import importStyles from '../styles/modalImport.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import { buscarProdutos, buscarServicos } from '../services/produtosService';

export interface ProdutoImportado {
    cProd?: string;
    ean: string;
    descricao: string;
    descricaoOriginal?: string;
    unidadeMedida: string;
    quantidade: number;
    valorUnitario: number;
    ncm?: string;
    cfop?: string;
    existe?: boolean;
    itemIdExistente?: number;
}

interface ModalImportItensProps {
    onClose: () => void;
    onImportSuccess: () => void;
    initialFile?: File | null;
}

type StatusItem = 'idle' | 'ok' | 'duplicado' | 'estoque_atualizado' | 'erro';

interface ItemComStatus extends ProdutoImportado {
    status: StatusItem;
    mensagem?: string;
}

interface SugestaoItem {
    id: number;
    tipo: 'PRODUTO' | 'SERVICO';
    nome: string;
    precoVenda: number;
    estoque?: number;
    codigoInterno?: string;
    ean?: string;
    categoriaNome?: string;
}

interface ItemNomeDropdownProps {
    item: ItemComStatus;
    onSelectSugestao: (sugestao: SugestaoItem) => void;
    onChangeTexto: (novoTexto: string) => void;
    disabled?: boolean;
}

const ItemNomeDropdown: React.FC<ItemNomeDropdownProps> = ({
    item,
    onSelectSugestao,
    onChangeTexto,
    disabled = false,
}) => {
    const [termo, setTermo] = useState(item.descricao || '');
    const [descricaoAnterior, setDescricaoAnterior] = useState(item.descricao || '');
    const [sugestoes, setSugestoes] = useState<SugestaoItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [aberto, setAberto] = useState(false);
    const [buscou, setBuscou] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    if (item.descricao !== descricaoAnterior) {
        setDescricaoAnterior(item.descricao || '');
        setTermo(item.descricao || '');
    }

    useEffect(() => {
        const handleClickFora = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setAberto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => document.removeEventListener('mousedown', handleClickFora);
    }, []);

    const executarBusca = async (texto: string) => {
        const query = texto.trim();
        if (!query) {
            setSugestoes([]);
            setLoading(false);
            setBuscou(false);
            setAberto(false);
            return;
        }

        setLoading(true);
        setBuscou(true);
        try {
            const [prodRes, servRes] = await Promise.all([
                buscarProdutos({ search: query, page: 1, pageSize: 8 }),
                buscarServicos({ search: query, page: 1, pageSize: 8 }),
            ]);

            const produtos: SugestaoItem[] = (prodRes.items || []).map((p) => ({
                id: p.id,
                tipo: 'PRODUTO',
                nome: p.nome,
                precoVenda: p.preco_venda,
                estoque: p.estoque,
                codigoInterno: p.codigo_interno,
                ean: p.codigos_barras?.find((b) => b.principal === 1)?.codigo_barras || p.codigos_barras?.[0]?.codigo_barras || '',
                categoriaNome: p.categoria_nome,
            }));

            const servicos: SugestaoItem[] = (servRes.items || []).map((s) => ({
                id: s.id,
                tipo: 'SERVICO',
                nome: s.nome,
                precoVenda: s.preco_venda,
                codigoInterno: s.codigo_interno,
                categoriaNome: s.categoria_nome,
            }));

            setSugestoes([...produtos, ...servicos]);
            setAberto(true);
        } catch (err) {
            console.error('Erro na busca de sugestões:', err);
            setSugestoes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTermo(val);
        onChangeTexto(val);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (val.trim().length > 0) {
            setLoading(true);
            setAberto(true);
            timeoutRef.current = setTimeout(() => {
                executarBusca(val);
            }, 250);
        } else {
            setAberto(false);
            setSugestoes([]);
            setBuscou(false);
            setLoading(false);
        }
    };

    const handleSelect = (s: SugestaoItem) => {
        setTermo(s.nome);
        onSelectSugestao(s);
        setAberto(false);
    };

    return (
        <div className={importStyles.dropdownContainer} ref={containerRef}>
            <div className={importStyles.inputWithIcon}>
                <input
                    type="text"
                    className={importStyles.nomeInput}
                    value={termo}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (buscou && sugestoes.length > 0) {
                            setAberto(true);
                        }
                    }}
                    disabled={disabled}
                    placeholder="Digite para buscar itens..."
                    title="Digite para buscar produtos/serviços cadastrados"
                />
                <SearchIcon className={importStyles.searchFieldIcon} fontSize="inherit" />
            </div>

            {aberto && (
                <div className={importStyles.dropdownMenu}>
                    {loading ? (
                        <div className={importStyles.dropdownLoading}>
                            <div className={importStyles.spinnerMini} />
                            <span>Buscando itens...</span>
                        </div>
                    ) : sugestoes.length > 0 ? (
                        <>
                            <div className={importStyles.dropdownHeader}>
                                Itens encontrados no sistema:
                            </div>
                            <ul className={importStyles.dropdownList}>
                                {sugestoes.map((s) => (
                                    <li
                                        key={`${s.tipo}-${s.id}`}
                                        className={importStyles.dropdownItem}
                                        onClick={() => handleSelect(s)}
                                    >
                                        <div className={importStyles.dropdownItemHeader}>
                                            <span className={importStyles.dropdownItemNome}>{s.nome}</span>
                                            <span className={s.tipo === 'PRODUTO' ? importStyles.typeBadgeProd : importStyles.typeBadgeServ}>
                                                {s.tipo === 'PRODUTO' ? 'PRODUTO' : 'SERVIÇO'}
                                            </span>
                                        </div>
                                        <div className={importStyles.dropdownItemMeta}>
                                            <span>R$ {s.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            {s.tipo === 'PRODUTO' && <span>Estoque: {s.estoque ?? 0}</span>}
                                            {s.ean && <span>EAN: {s.ean}</span>}
                                            {s.codigoInterno && <span>Cód: {s.codigoInterno}</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : buscou ? (
                        <div className={importStyles.dropdownEmpty}>
                            Nenhum produto ou serviço encontrado para &quot;{termo}&quot;
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

const ModalImportItens: React.FC<ModalImportItensProps> = ({ onClose, onImportSuccess, initialFile }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogRef, true);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [importando, setImportando] = useState(false);
    const [produtos, setProdutos] = useState<ItemComStatus[]>([]);
    const [erro, setErro] = useState<string | null>(null);
    const [concluido, setConcluido] = useState(false);

    const processarArquivo = useCallback(async (file: File) => {
        if (!file.name.endsWith('.xml')) {
            setErro('Selecione um arquivo XML válido de nota fiscal.');
            return;
        }

        setLoading(true);
        setErro(null);
        setProdutos([]);
        setConcluido(false);
        setNomeArquivo(file.name);

        try {
            const text = await file.text();
            const response = await fetch('/api/produtos/itens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xml: text, preview: true }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                setErro(result.error || 'Erro ao processar o arquivo XML.');
                return;
            }

            const itensComStatus: ItemComStatus[] = (result.produtos as ProdutoImportado[]).map((p) => ({
                ...p,
                descricaoOriginal: p.descricaoOriginal || p.descricao,
                status: 'idle',
            }));
            setProdutos(itensComStatus);
        } catch (err) {
            setErro('Erro inesperado ao ler o arquivo. Verifique se é uma NF-e válida.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialFile) {
            const timer = setTimeout(() => processarArquivo(initialFile), 0);
            return () => clearTimeout(timer);
        }
    }, [initialFile, processarArquivo]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processarArquivo(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processarArquivo(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleImportar = async () => {
        if (produtos.length === 0) return;
        setImportando(true);
        setErro(null);

        const resultados: ItemComStatus[] = [...produtos];

        for (let i = 0; i < resultados.length; i++) {
            const produto = resultados[i];
            try {
                const response = await fetch('/api/produtos/itens', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ importar: true, produto }),
                });
                const result = await response.json();

                if (!response.ok || result.error) {
                    resultados[i] = { ...produto, status: result.duplicado ? 'duplicado' : 'erro', mensagem: result.error };
                } else {
                    if (result.estoqueAtualizado) {
                         resultados[i] = { ...produto, status: 'estoque_atualizado', mensagem: 'Estoque atualizado com sucesso' };
                    } else {
                         resultados[i] = { ...produto, status: 'ok' };
                    }
                }
            } catch {
                resultados[i] = { ...produto, status: 'erro', mensagem: 'Falha na requisição' };
            }
            setProdutos([...resultados]);
        }

        setImportando(false);
        setConcluido(true);
        onImportSuccess();
    };

    const handleUpdateItemDescricao = (index: number, novoNome: string) => {
        setProdutos((prev) => {
            const copy = [...prev];
            const item = copy[index];
            copy[index] = {
                ...item,
                descricao: novoNome,
                existe: false,
                itemIdExistente: undefined,
            };
            return copy;
        });
    };

    const handleSelectSugestaoItem = (index: number, sugestao: SugestaoItem) => {
        setProdutos((prev) => {
            const copy = [...prev];
            const item = copy[index];
            copy[index] = {
                ...item,
                descricao: sugestao.nome,
                existe: true,
                itemIdExistente: sugestao.id,
                ean: item.ean || sugestao.ean || '',
            };
            return copy;
        });
    };

    const handleEditarItem = (item: ProdutoImportado) => {
        if (!item.itemIdExistente) return;
        window.open(`/cadastro?id=${item.itemIdExistente}`, '_blank');
    };

    const handleCadastroRapido = (item: ProdutoImportado) => {
        const params = new URLSearchParams();
        params.append('novoImport', '1');
        if (item.descricao) params.append('nome', item.descricao);
        if (item.valorUnitario) params.append('precoCompra', String(item.valorUnitario));
        if (item.quantidade) params.append('estoque', String(item.quantidade));
        if (item.unidadeMedida) params.append('unidade', item.unidadeMedida);
        if (item.ean) params.append('ean', item.ean);
        if (item.cProd) params.append('codigoInterno', item.cProd);

        window.open(`/cadastro?${params.toString()}`, '_blank');
    };

    const totalOk = produtos.filter((p) => p.status === 'ok').length;
    const totalEstAtualizado = produtos.filter((p) => p.status === 'estoque_atualizado').length;
    const totalDup = produtos.filter((p) => p.status === 'duplicado').length;
    const totalErro = produtos.filter((p) => p.status === 'erro').length;

    return (
        <div className={styles.modalOverlay} role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div
                className={`${styles.modalContent} ${importStyles.modalLarge}`}
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-import-title"
                tabIndex={-1}
            >
                {/* Cabeçalho */}
                <div className={importStyles.modalHeader}>
                    <h3 id="modal-import-title" className={styles.modalTitle}>
                        Importar Produtos via Nota Fiscal (XML)
                    </h3>
                    <button className={importStyles.closeBtn} onClick={onClose} aria-label="Fechar" type="button">
                        <CloseIcon fontSize="small" />
                    </button>
                </div>

                {/* Área de upload */}
                {!produtos.length && !loading && (
                    <div
                        className={`${importStyles.dropZone} ${isDragOver ? importStyles.dropZoneActive : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Área para soltar arquivo XML"
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                        <UploadFileIcon className={importStyles.dropIcon} />
                        <p className={importStyles.dropText}>
                            Arraste um arquivo <strong>.xml</strong> de NF-e aqui ou clique para selecionar
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xml"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            id="xml-file-input"
                        />
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className={importStyles.loadingArea}>
                        <div className={importStyles.spinner} />
                        <p>Lendo nota fiscal…</p>
                    </div>
                )}

                {/* Erro */}
                {erro && (
                    <div className={importStyles.errorBanner}>
                        <WarningAmberIcon fontSize="small" />
                        <span>{erro}</span>
                    </div>
                )}

                {/* Tabela de produtos */}
                {produtos.length > 0 && (
                    <>
                        <div className={importStyles.fileInfo}>
                            <span className={importStyles.fileName}>{nomeArquivo}</span>
                            <span className={importStyles.prodCount}>{produtos.length} produto(s) encontrado(s)</span>
                            {!concluido && (
                                <button
                                    type="button"
                                    className={importStyles.trocarBtn}
                                    onClick={() => {
                                        setProdutos([]);
                                        setNomeArquivo(null);
                                        setErro(null);
                                        setConcluido(false);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                >
                                    Trocar arquivo
                                </button>
                            )}
                        </div>

                        {concluido && (
                            <div className={importStyles.resumoBanner}>
                                <FileDownloadDoneIcon />
                                <span>
                                    Importação concluída: <strong>{totalOk}</strong> inserido(s)
                                    {totalEstAtualizado > 0 && <>, <strong>{totalEstAtualizado}</strong> estoque atualizado</>}
                                    {totalDup > 0 && <>, <strong>{totalDup}</strong> duplicado(s)</>}
                                    {totalErro > 0 && <>, <strong>{totalErro}</strong> erro(s)</>}
                                </span>
                            </div>
                        )}

                        <div className={importStyles.tableWrapper}>
                            <table className={importStyles.importTable}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th style={{ minWidth: '220px' }}>Produto na NF-e</th>
                                        <th style={{ minWidth: '250px' }}>Item no Sistema (Vínculo)</th>
                                        <th>Un.</th>
                                        <th>Qtd.</th>
                                        <th>Vlr. Unit. (R$)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map((p, i) => (
                                        <tr key={i} className={importStyles[`row_${p.status}`]}>
                                            <td>{i + 1}</td>
                                            <td className={importStyles.colNfProduto}>
                                                <div className={importStyles.nomeNfTexto} title={p.descricaoOriginal || p.descricao}>
                                                    {p.descricaoOriginal || p.descricao}
                                                </div>
                                                {(p.ean || p.cProd) && (
                                                    <div className={importStyles.subCode}>
                                                        {p.ean && <span>EAN: {p.ean}</span>}
                                                        {p.ean && p.cProd && p.cProd !== p.ean && <span> · </span>}
                                                        {p.cProd && p.cProd !== p.ean && <span>Cód: {p.cProd}</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <ItemNomeDropdown
                                                    item={p}
                                                    onSelectSugestao={(sugestao) => handleSelectSugestaoItem(i, sugestao)}
                                                    onChangeTexto={(novoTexto) => handleUpdateItemDescricao(i, novoTexto)}
                                                    disabled={concluido || importando}
                                                />
                                                {!concluido && (
                                                    <div className={importStyles.cadastroRapidoContainer}>
                                                        {p.existe && p.itemIdExistente ? (
                                                            <button
                                                                type="button"
                                                                className={importStyles.btnEditarItem}
                                                                onClick={() => handleEditarItem(p)}
                                                                title="Abrir edição deste item em nova aba"
                                                            >
                                                                <EditIcon fontSize="inherit" />
                                                                <span>Editar item</span>
                                                                <OpenInNewIcon fontSize="inherit" className={importStyles.iconExternal} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className={importStyles.btnCadastroRapido}
                                                                onClick={() => handleCadastroRapido(p)}
                                                                title="Abrir formulário de cadastro em nova aba"
                                                            >
                                                                <AddIcon fontSize="inherit" />
                                                                <span>Cadastro rápido</span>
                                                                <OpenInNewIcon fontSize="inherit" className={importStyles.iconExternal} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{p.unidadeMedida}</td>
                                            <td>{p.quantidade}</td>
                                            <td>
                                                {p.valorUnitario.toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 4,
                                                })}
                                            </td>
                                            <td>
                                                {p.status === 'idle' && (
                                                    p.existe ? (
                                                        <span className={importStyles.badgeExistente} title="Produto já cadastrado no sistema">
                                                            <CheckCircleOutlineIcon fontSize="inherit" /> No Sistema
                                                        </span>
                                                    ) : (
                                                        <span className={importStyles.badgeNaoCadastrado} title="Produto novo">
                                                            Não Cadastrado
                                                        </span>
                                                    )
                                                )}
                                                {p.status === 'ok' && (
                                                    <span className={importStyles.badgeOk}>
                                                        <CheckCircleOutlineIcon fontSize="inherit" /> Importado
                                                    </span>
                                                )}
                                                {p.status === 'estoque_atualizado' && (
                                                    <span className={importStyles.badgeEstoqueAtualizado} title={p.mensagem}>
                                                        <CheckCircleOutlineIcon fontSize="inherit" /> Est. Atualizado
                                                    </span>
                                                )}
                                                {p.status === 'duplicado' && (
                                                    <span className={importStyles.badgeDup} title={p.mensagem}>
                                                        <WarningAmberIcon fontSize="inherit" /> Duplicado
                                                    </span>
                                                )}
                                                {p.status === 'erro' && (
                                                    <span className={importStyles.badgeErro} title={p.mensagem}>
                                                        <WarningAmberIcon fontSize="inherit" /> Erro
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Rodapé */}
                <div className={styles.modalActions}>
                    {produtos.length > 0 && !concluido && (
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleImportar}
                            disabled={importando}
                            id="btn-confirmar-importacao"
                        >
                            {importando ? 'Importando…' : `Importar ${produtos.length} produto(s)`}
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onClose}
                        id="btn-fechar-import"
                    >
                        {concluido ? 'Fechar' : 'Cancelar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalImportItens;
