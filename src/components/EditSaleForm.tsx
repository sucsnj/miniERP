import { FormEvent, useState, useEffect, useRef } from "react";
import { buscarVendaItens, atualizarVenda, VendaDiaria, VendaItemData } from "../services/vendasService";
import ModalCarrinho from "./ModalCarrinho";
import ModalSelecionarItens from "./ModalSelecionarItens";
import { useCart } from "../hooks/useCart";
import parseNumber from "../utils/number";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

interface EditSaleFormProps {
  sale: VendaDiaria;
  onSaved: () => void;
  onCancel: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

const EditSaleForm: React.FC<EditSaleFormProps> = ({ sale, onSaved, onCancel, onToast }) => {
  const [editData, setEditData] = useState(sale.data);
  const [editValor, setEditValor] = useState(sale.valor.toFixed(2));
  const [editObservacoes, setEditObservacoes] = useState(sale.observacoes ?? "");
  const [loadingItens, setLoadingItens] = useState(true);
  const editValorInputRef = useRef<HTMLInputElement | null>(null);

  // Estado e ações do carrinho (catálogo, seleção e gerenciamento), compartilhado
  // com o formulário de registrar venda através do hook useCart
  const {
    cartItems,
    setCartItems,
    cartSearch,
    setCartSearch,
    catalogItems,
    loadingCatalog,
    selecionarOpen,
    cartModalOpen,
    handleCartClick,
    closeSelecao,
    openCarrinho,
    closeCarrinho,
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
      setLoadingItens(true);
      const itens: VendaItemData[] = await buscarVendaItens(sale.id);
      setCartItems(
        itens.map((item) => ({
          id: item.item_id ?? item.id,
          tipo: item.tipo,
          nome: item.nome,
          preco_venda: item.preco_unitario,
          quantidade: item.quantidade,
          codigo_interno: item.codigo_interno ?? undefined,
          referencia: item.referencia ?? undefined,
        }))
      );
      setLoadingItens(false);
    };
    load();
  }, [sale.id, setCartItems]);

  // Recalcula o valor total quando os itens do carrinho mudam
  // (padrão React de ajustar estado durante a renderização, preservando
  // o campo quando o carrinho fica vazio)
  const [prevCartItems, setPrevCartItems] = useState(cartItems);
  if (cartItems !== prevCartItems) {
    setPrevCartItems(cartItems);
    if (cartItems.length > 0) {
      const total = cartItems.reduce((acc, item) => acc + (item.preco_venda ?? 0) * item.quantidade, 0);
      setEditValor(total.toFixed(2));
    }
  }

  // Foca no input de valor ao abrir
  useEffect(() => {
    editValorInputRef.current?.focus();
    editValorInputRef.current?.select();
  }, []);

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();

    const valor = parseNumber(editValor);

    try {
      await atualizarVenda(
        sale.id,
        editData,
        valor,
        editObservacoes,
        cartItems.map((item) => ({
          item_id: item.id,
          tipo: item.tipo,
          nome: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.preco_venda,
          codigo_interno: item.codigo_interno ?? null,
          referencia: item.referencia ?? null,
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
      <form onSubmit={handleSaveEdit} className="glass-form">
        <h2>Editar Venda</h2>

        <label>
          Data:
          <input
            type="date"
            value={editData}
            onChange={(e) => setEditData(e.target.value)}
            required
          />
        </label>

        <label>
          Valor:
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}
          className="input-with-icon-wrapper"
          >
            <input
              ref={editValorInputRef}
              type="number"
              step="0.01"
              value={editValor}
              onChange={(e) => setEditValor(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="cart-icon-button"
              onClick={handleCartClick}
              aria-label="Abrir carrinho"
              title="Abrir carrinho"
            >
              <AddShoppingCartIcon className="cart-icon" />
              {totalCartCount > 0 && (
                <span className="cart-badge">{totalCartCount}</span>
              )}
            </button>
            <button
              type="button"
              className="cart-icon-button"
              onClick={openCarrinho}
              aria-label="Editar itens da venda"
              title="Editar itens da venda"
            >
              <ShoppingCartIcon className="cart-icon" />
              {totalCartCount > 0 && (
                <span className="cart-badge">{totalCartCount}</span>
              )}
            </button>
          </div>
          {cartItems.length > 0 && (
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px", display: "block" }}>
              {cartItems.length} {cartItems.length === 1 ? "item" : "itens"} no carrinho — valor recalculado automaticamente
            </span>
          )}
          {loadingItens && (
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px", display: "block" }}>
              Carregando itens...
            </span>
          )}
        </label>

        <label>
          Observações:
          <textarea
            className="flex-grow-edit-observacoes"
            value={editObservacoes}
            onChange={(e) => setEditObservacoes(e.target.value)}
          />
        </label>

        <button className="button-edit" type="submit">Salvar Alteração</button>
        <button type="button" onClick={onCancel} className="button-spacing button-delete">
          Cancelar
        </button>
      </form>

      {/* Modal de seleção de itens (adicionar ao carrinho) */}
      <ModalSelecionarItens
        isOpen={selecionarOpen}
        onClose={closeSelecao}
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
      <ModalCarrinho
        isOpen={cartModalOpen}
        onClose={closeCarrinho}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </>
  );
};

export default EditSaleForm;