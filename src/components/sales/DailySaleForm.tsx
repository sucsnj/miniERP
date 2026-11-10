import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import { formatCurrency } from '../../utils/formatter';
import { useDailySaleForm } from '../../hooks/useDailySaleForm';
import Button from '@/components/common/Button';
import type { DailySale } from '../../services/vendasService';
import CartModal from '@/components/cart/CartModal';
import PixModal from '@/components/pix/PixModal';
import SelectItemsModal from '@/components/cart/SelectItemsModal';
import styles from '../../styles/dailySaleForm.module.css';

interface DailySaleFormProps {
  sales?: DailySale[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaleAdded?: () => void;
  onEditSale?: (sale: DailySale) => void;
  onDeleteSale?: (id: number) => void;
  showHistory?: boolean;
}

// Formulário de venda diária (dashboard `/`). Componente apresentacional:
// a lógica de estado/validação/ações vive em `useDailySaleForm`
// (ver docs/components/DailySaleForm.md e docs/hooks/Hooks.md).
const DailySaleForm: React.FC<DailySaleFormProps> = ({
  selectedDate,
  onDateChange,
  onSaleAdded,
}) => {
  const {
    value,
    observations,
    setObservations,
    loading,
    clearing,
    calculatedValue,
    isValueInvalid,
    pixModalOpen,
    setPixModalOpen,
    pixPayload,
    pixAmount,
    valueInputRef,
    observationsTextareaRef,
    formRef,
    handleKeyDown,
    handleValueChange,
    handlePixClick,
    handleSubmit,
    handleClear,
    addOperator,
    cartItems,
    cartSearch,
    setCartSearch,
    catalogItems,
    loadingCatalog,
    selectModalOpen,
    cartModalOpen,
    handleCartClick,
    closeSelectModal,
    closeCartModal,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount,
  } = useDailySaleForm({ selectedDate, onSaleAdded });

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className={`${styles.dailySaleForm}`}>
        <h2>Registrar Venda Diária</h2>
        <div className={`${styles.saleFormGrid}`}>
          <div className={`${styles.saleFormFields}`}>
            <label>
              {/* Data: */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className={`${styles.dateInput} flex-grow-data`}
              />
            </label>
            <div className={`${styles.mathButtons}`}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('+')}
              >
                <span>+</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('-')}
              >
                <span>-</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('*')}
              >
                <span>×</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('/')}
              >
                <span>÷</span>
              </Button>
            </div>
            <label>
              {/* Valor: */}
              <div className={`${styles.inputWithIconWrapper}`}>
                <input
                  ref={valueInputRef}
                  type="text"
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={value}
                  onChange={handleValueChange}
                  autoFocus
                  className="flex-grow-valor"
                  placeholder={'Valor'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`${styles.cartIconButton}`}
                  style={{ background: 'transparent', border: 'none', padding: '6px' }}
                  onClick={handleCartClick}
                  aria-label="Abrir carrinho"
                  title="Abrir carrinho"
                >
                  <AddShoppingCartIcon className={`${styles.cartIcon}`} />
                  {totalCartCount > 0 && (
                    <span className={`${styles.cartBadge}`}>{totalCartCount}</span>
                  )}
                </Button>
              </div>
              <span className={`${styles.displayValue}`}>
                {/* botão para gerar qrcode pix */}
                <span className={`${styles.pixButton}`} onClick={handlePixClick}>
                  <QrCode2Icon className="pix-icon" />
                </span>
                <span className={`${styles.pixButton}`} onClick={handlePixClick}>
                  {isValueInvalid ? 'Inválido' : formatCurrency(Math.min(calculatedValue ?? 0, 9999999), 2)}
                </span>
              </span>
            </label>
            <label>
              {/* Observações: */}
              <textarea
                value={observations}
                ref={observationsTextareaRef}
                onChange={(e) => setObservations(e.target.value)}
                className="flex-grow-observacoes"
                placeholder={'Observações...'}
              />
            </label>
            <div className="buttons-wrapper">
              <Button
                type="submit"
                variant="success"
                                disabled={loading}
                leftIcon={<SaveIcon />}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
              <Button
                type="button"
                variant="danger"
                                disabled={clearing}
                onClick={handleClear}
                leftIcon={<ClearIcon />}
              >
                {clearing ? 'Limpando...' : 'Limpar'}
              </Button>
            </div>
          </div>
        </div>
      </form>
      <SelectItemsModal
        isOpen={selectModalOpen}
        onClose={closeSelectModal}
        onManageCart={handleManageCart}
        cartItems={cartItems}
        catalogItems={catalogItems}
        loadingCatalog={loadingCatalog}
        cartSearch={cartSearch}
        onCartSearchChange={setCartSearch}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />
      <CartModal
        isOpen={cartModalOpen}
        onClose={closeCartModal}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
      <PixModal
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
        payload={pixPayload}
        merchantName={process.env.NEXT_PUBLIC_PIX_NAME ?? ''}
        merchantBank={process.env.NEXT_PUBLIC_PIX_BANK ?? ''}
        amount={pixAmount}
        pixKey={process.env.NEXT_PUBLIC_PIX_KEY ?? ''}
      />
</>
  );
};

export default DailySaleForm;
