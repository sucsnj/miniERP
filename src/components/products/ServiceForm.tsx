import type { Dispatch, RefObject, SetStateAction } from 'react';
import styles from '../../styles/produtos.module.css';
import MoreVert from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import Button from '@/components/common/Button';
import { parseNumber } from '../../utils/number';
import { formatCurrencyNumber } from '../../utils/formatter';
// CategoryData type not needed directly in this component
import type { ProductFormData, ProductOptions, ProductActions } from './ProductForm';

interface ServiceFormProps {
  editingProductId: number | null;
  form: ProductFormData;
  setForm: Dispatch<SetStateAction<ProductFormData>>;
  options: ProductOptions;
  actions: ProductActions;
  inputRef: RefObject<HTMLInputElement | null>;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  editingProductId,
  form,
  setForm,
  options,
  actions,
  inputRef,
}) => {
  return (
    <div>
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
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
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
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
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
            value={form.categoryId}
            onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : 1 }))}
          >
            {options.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="primary"
            size="sm"
            iconOnly
            onClick={actions.openCategoryModal}
            title="Adicionar Categoria"
            aria-label="Adicionar Categoria"
            id="add-categoria-btn"
            leftIcon={<AddIcon fontSize="small" />}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconOnly
            onClick={() => {
              const selectedCategory = options.categories.find((c) => c.id === form.categoryId);
              if (selectedCategory) {
                actions.editCategory(selectedCategory);
              }
            }}
            title="Editar Categoria Selecionada"
            aria-label="Editar Categoria Selecionada"
            id="edit-categoria-btn"
            leftIcon={<MoreVert fontSize="small" />}
          />
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
            value={form.salePrice}
            onChange={(e) => {
              const salePrice = e.target.value;
              const salePriceValue = parseNumber(salePrice);
              if (!Number.isNaN(salePriceValue) && salePriceValue >= 0) {
                setForm(prev => ({ ...prev, salePrice: String(formatCurrencyNumber(salePriceValue, 2)) }));
                return;
              }
              setForm(prev => ({ ...prev, salePrice }));
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
            value={form.durationMinutes}
            onChange={(e) => setForm(prev => ({ ...prev, durationMinutes: e.target.value }))}
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
          placeholder={editingProductId ? 'Código Interno não pode ser alterado' : 'Ex: SERV-001 (preenchido automaticamente caso deixado em branco)'}
          value={form.internalCode}
          onChange={(e) => setForm(prev => ({ ...prev, internalCode: e.target.value }))}
          disabled={!!editingProductId}
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
          value={form.reference}
          onChange={(e) => setForm(prev => ({ ...prev, reference: e.target.value }))}
        />
      </div>
    </div>
  );
};

export default ServiceForm;
