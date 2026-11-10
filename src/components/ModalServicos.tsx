// Modal para adição, edição e exclusão de serviços
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useFocusTrap } from '@/utils/focus';
import {
    type CategoriaData,
    type ServicoData,
    type ServicoInput,
    atualizarServico,
    buscarCategorias,
    buscarServicoPorId,
    excluirServico,
    registrarServico,
} from '@/services/produtosService';
import styles from '@/styles/produtos.module.css';

interface ModalServicosProps {
    isOpen: boolean;
    onClose: () => void;
    servicos?: ServicoData | null;
    onSave: (servico: ServicoData) => void;
}

const createInitialForm = (servico?: ServicoData | null): ServicoInput => ({
    nome: servico?.nome ?? '',
    descricao: servico?.descricao ?? '',
    categoria_id: servico?.categoria_id ?? 0,
    preco_venda: servico?.preco_venda ?? 0,
    codigo_interno: servico?.codigo_interno ?? '',
    referencia: servico?.referencia ?? '',
    duracao_minutos: servico?.duracao_minutos ?? 0,
});

export default function ModalServicos({ isOpen, onClose, servicos, onSave }: ModalServicosProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const nomeInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<ServicoInput>(createInitialForm(servicos));
    const [categorias, setCategorias] = useState<CategoriaData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEdit = Boolean(servicos?.id);
    const servicoId = servicos?.id;

    const [prevModalKey, setPrevModalKey] = useState(`${isOpen}:${servicoId ?? 'novo'}`);
    const modalKey = `${isOpen}:${servicoId ?? 'novo'}`;
    if (modalKey !== prevModalKey) {
        setPrevModalKey(modalKey);
        setError('');
        setFormData(createInitialForm(servicos));
    }

    useFocusTrap(dialogRef, isOpen);

    useEffect(() => {
        if (!isOpen) return;

        let active = true;
        const loadCategorias = async () => {
            try {
                const categoriasData = await buscarCategorias();
                if (active) setCategorias(categoriasData);
            } catch {
                if (active) setCategorias([]);
            }
        };

        loadCategorias();

        if (servicoId) {
            const loadServico = async () => {
                try {
                    const servicoAtual = await buscarServicoPorId(servicoId);
                    if (active && servicoAtual) {
                        setFormData(createInitialForm(servicoAtual));
                    }
                } catch {
                    if (active) setError('Não foi possível carregar os dados do serviço.');
                }
            };

            loadServico();
        }

        return () => {
            active = false;
        };
    }, [isOpen, servicoId]);

    useEffect(() => {
        if (isOpen) {
            nomeInputRef.current?.focus();
        }
    }, [isOpen]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'categoria_id' || name === 'preco_venda' || name === 'duracao_minutos'
                ? Number(value)
                : value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: ServicoInput = {
                ...formData,
                categoria_id: Number(formData.categoria_id || 0),
                preco_venda: Number(formData.preco_venda || 0),
                duracao_minutos: Number(formData.duracao_minutos || 0),
            };

            const saved = isEdit && servicos?.id
                ? await atualizarServico(servicos.id, payload)
                : await registrarServico(payload);

            onSave(saved as ServicoData);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar o serviço.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!servicos?.id) return;

        setLoading(true);
        setError('');

        try {
            await excluirServico(servicos.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir o serviço.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            role="presentation"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={onClose}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-servico-title"
                style={{
                    width: '100%',
                    maxWidth: 620,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: 'var(--shadow)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.panelHeader}>
                    <h3 id="modal-servico-title" style={{ margin: 0 }}>{isEdit ? 'Editar serviço' : 'Novo serviço'}</h3>
                    <button type="button" className={styles.manageButton} onClick={onClose} aria-label="Fechar modal">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error ? (
                        <div style={{ marginBottom: 12, color: 'var(--danger)', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    ) : null}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="servico-nome">Nome</label>
                        <input
                            ref={nomeInputRef}
                            id="servico-nome"
                            name="nome"
                            className={styles.inputField}
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="servico-descricao">Descrição</label>
                        <textarea
                            id="servico-descricao"
                            name="descricao"
                            className={styles.textareaField}
                            rows={3}
                            value={formData.descricao ?? ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="servico-categoria">Categoria</label>
                        <select
                            id="servico-categoria"
                            name="categoria_id"
                            className={styles.selectField}
                            value={formData.categoria_id ?? 0}
                            onChange={handleChange}
                            required
                        >
                            <option value={0}>Selecione uma categoria</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="servico-preco">Preço de venda</label>
                        <input
                            id="servico-preco"
                            name="preco_venda"
                            className={styles.inputField}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.preco_venda ?? 0}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="servico-codigo">Código interno</label>
                        <input
                            id="servico-codigo"
                            name="codigo_interno"
                            className={styles.inputField}
                            value={formData.codigo_interno ?? ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="servico-referencia">Referência</label>
                        <input
                            id="servico-referencia"
                            name="referencia"
                            className={styles.inputField}
                            value={formData.referencia ?? ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="servico-duracao">Duração (minutos)</label>
                        <input
                            id="servico-duracao"
                            name="duracao_minutos"
                            className={styles.inputField}
                            type="number"
                            min="0"
                            value={formData.duracao_minutos ?? 0}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.filterActions}>
                        <button type="submit" className={styles.addButton} disabled={loading}>
                            {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
                        </button>
                        {isEdit ? (
                            <button type="button" className={styles.manageButton} onClick={handleDelete} disabled={loading}>
                                Excluir
                            </button>
                        ) : null}
                        <button type="button" className={styles.manageButton} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

