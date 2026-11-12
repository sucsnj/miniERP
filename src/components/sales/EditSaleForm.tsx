import { FormEvent, useState, useEffect, useRef } from "react";
import { fetchSaleItems, updateSale, DailySale, SaleItemData } from "../../services/salesService";
import CartModal from "@/components/cart/CartModal";
import SelectItemsModal from "@/components/cart/SelectItemsModal";
import { useCart } from "../../hooks/useCart";
import parseNumber from "../../utils/number";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import styles from '@/styles/sales.module.css';
import Button from '@/components/common/Button';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Panel from '@/components/common/Panel';
import PanelHeader from '@/components/common/PanelHeader';
import Form from '@/components/common/Form';
import { SkeletonText } from '@/components/common/Skeleton';

interface EditSaleFormProps {
  sale: DailySale;
  onSaved: () => void;
  onCancel: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

const EditSaleForm: React.FC<EditSaleFormProps> = ({ sale, onSaved, onCancel, onToast }) => {
  const [editDate, setEditDate] = useState(sale.date);
  const [editAmount, setEditAmount] = useState(sale.amount.toFixed(2));
  const [editNotes, setEditNotes] = useState(sale.notes ?? "");
  const [loadingItems, setLoadingItems] = useState(true);
  const editAmountInputRef = useRef<HTMLInputElement | null>(null);

  // Estado e ações do carrinho (catálogo, seleção e gerenciamento), compartilhado
  // com o formulário de registrar venda através do hook useCart
  const {
    cartItems,
    setCartItems,
    cartSearch,
    setCartSearch,
    catalogItems,
    loadingCatalog,
    selectModalOpen,
    cartModalOpen,
    handleCartClick,
    closeSelectModal,
    openCartModal,
    closeCartModal,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount,
  } = useCart(onToast);

  // Carrega os itens existentes da venda ao abrir o form
  useEffect(() => {
    const load = async () => {
      setLoadingItems(true);
      const items: SaleItemData[] = await fetchSaleItems(sale.id);
      setCartItems(
        items.map((item) => ({
          id: item.item_id ?? item.id,
          kind: item.kind,
          name: item.name,
          salePrice: item.unitPrice,
          quantity: item.quantity,
          internalCode: item.internalCode ?? undefined,
          reference: item.reference ?? undefined,
        }))
      );
      setLoadingItems(false);
    };
    load();
  }, [sale.id, setCartItems]);

  // Recalcula o amount total quando os itens do carrinho mudam
  // (padrão React de ajustar estado durante a renderização, preservando
  // o campo quando o carrinho fica vazio)
  const [prevCartItems, setPrevCartItems] = useState(cartItems);
  if (cartItems !== prevCartItems) {
    setPrevCartItems(cartItems);
    if (cartItems.length > 0) {
      const total = cartItems.reduce((acc, item) => acc + (item.salePrice ?? 0) * item.quantity, 0);
      setEditAmount(total.toFixed(2));
    }
  }

  // Foca no input de amount ao abrir
  useEffect(() => {
    editAmountInputRef.current?.focus();
    editAmountInputRef.current?.select();
  }, []);

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();

    const amount = parseNumber(editAmount);

    try {
      await updateSale(
        sale.id,
        editDate,
        amount,
        editNotes,
        cartItems.map((item) => ({
          item_id: item.id,
          kind: item.kind,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.salePrice,
          internalCode: item.internalCode ?? null,
          reference: item.reference ?? null,
        }))
      );
      onToast("Venda atualizada com sucesso.", "success");
      onSaved();
    } catch {
      onToast("Erro ao salvar alteração.", "error");
    }
  };

  return (
    <>
      <Panel>
        <PanelHeader title="Editar Venda" />
        <Form onSubmit={handleSaveEdit}>

        <label>
          Data:
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            required
          />
        </label>

        <label>
          Valor:
          <div className={styles.cartControls}>
            <input
              ref={editAmountInputRef}
              type="number"
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.cartIconButton}
              onClick={handleCartClick}
              aria-label="Abrir carrinho"
              title="Abrir carrinho"
            >
              <AddShoppingCartIcon className={styles.cartIcon} />
              {totalCartCount > 0 && (
                <span className={styles.cartBadge}>{totalCartCount}</span>
              )}
            </Button>
            <Button
              type="button"
              className={styles.cartIconButton}
              onClick={openCartModal}
              aria-label="Editar itens da venda"
              title="Editar itens da venda"
            >
              <ShoppingCartIcon className={styles.cartIcon} />
              {totalCartCount > 0 && (
                <span className={styles.cartBadge}>{totalCartCount}</span>
              )}
            </Button>
          </div>
          {cartItems.length > 0 && (
            <span className={styles.cartHint}>
              {cartItems.length} {cartItems.length === 1 ? "item" : "itens"} no carrinho — amount recalculado automaticamente
            </span>
          )}
          {loadingItems && (
            <SkeletonText lines={2} />
          )}
        </label>

        <label>
          Observações:
          <textarea
            className="flex-grow-edit-observacoes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />
        </label>

        <Button type="submit" variant="success" leftIcon={<SaveIcon />}>Salvar Alteração</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="button-spacing" leftIcon={<CancelIcon />}>
          Cancelar
        </Button>
      </Form>
      </Panel>

      {/* Modal de seleção de itens (adicionar ao carrinho) */}
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

      {/* Modal de carrinho para editar itens */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={closeCartModal}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </>
  );
};

export default EditSaleForm;