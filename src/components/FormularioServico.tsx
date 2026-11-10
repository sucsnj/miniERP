import type { Dispatch, RefObject, SetStateAction } from 'react';
import styles from '../styles/produtos.module.css';
import MoreVert from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { parseNumber } from '../utils/number';
import { formatCurrencyNumber } from '../utils/formatter';
// CategoriaData type not needed directly in this component
import type { ProdutoFormData, ProdutoOptions, ProdutoActions } from './FormularioProduto';

interface FormularioServicoProps {
  editarProdutoId: number | null;
  form: ProdutoFormData;
  setForm: Dispatch<SetStateAction<ProdutoFormData>>;
  options: ProdutoOptions;
  actions: ProdutoActions;
  inputRef: RefObject<HTMLInputElement | null>;
}

const FormularioServico: React.FC<FormularioServicoProps> = ({
  editarProdutoId,
  form,
  setForm,
  options,
  actions,
  inputRef,
}) => {
  return (
    <div className="CadastroEdicao">
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="form-nome">
          Nome:*
        </label>
        <input
          id="form-nome"
          ref={inputRef}
          type="text"
          className={styles.inputField}
          placeholder="Nome do serviço"
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
            onChange={(e) => setForm(prev => ({ ...prev, categoriaId: e.target.value ? Number(e.target.value) : 1 }))}
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
          <button
            type="button"
            className={styles.manageButton}
            onClick={() => {
              const categoriaSelecionada = options.categorias.find((c) => c.id === form.categoriaId);
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

      <div className={styles.valoresGroupServico}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="form-preco-venda">
            Preço Venda:
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
              const precoValor = parseNumber(precoVenda);
              if (!Number.isNaN(precoValor) && precoValor >= 0) {
                setForm(prev => ({ ...prev, precoVenda: String(formatCurrencyNumber(precoValor, 2)) }));
                return;
              }
              setForm(prev => ({ ...prev, precoVenda }));
            }}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="form-duracao">
            Duração (minutos):
          </label>
          <input
            id="form-duracao"
            type="text"
            inputMode="numeric"
            className={styles.inputField}
            placeholder="Ex: 60"
            value={form.duracaoMinutos}
            onChange={(e) => setForm(prev => ({ ...prev, duracaoMinutos: e.target.value }))}
          />
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
          placeholder={editarProdutoId ? 'Código Interno não pode ser alterado' : 'Ex: SERV-001 (preenchido automaticamente caso deixado em branco)'}
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
  );
};

export default FormularioServico;
