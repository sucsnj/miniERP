/**
 * src/components/cart/SelectItemsModal.tsx
 *
 * Modal de seleção de itens do catálogo. Apresentacional — sem estado
 * próprio (busca/soma vêm do `useCart` via props) e com a casca visual
 * compartilhada no `CartModalShell`. Ver docs/components/SelectItemsModal.md.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { formatCurrency } from '../../utils/formatter';
import { getCartSummary } from '../../utils/cart';
import { CartModalShell } from './CartModalShell';
import { ItemData } from '../../services/produtosService';
import type { CartItem } from '../../types/sale';
import styles from '../../styles/selectItemsModal.module.css';
import Button from '@/components/common/Button';

interface SelectItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManageCart: () => void;
  cartItems: CartItem[];
  catalogItems: ItemData[];
  loadingCatalog: boolean;
  cartSearch: string;
  onCartSearchChange: (value: string) => void;
  onAddToCart: (item: ItemData) => void;
  onRemoveFromCart: (item: ItemData) => void;
}

const SelectItemsModal: React.FC<SelectItemsModalProps> = ({
  isOpen,
  onClose,
  onManageCart,
  cartItems,
  catalogItems,
  loadingCatalog,
  cartSearch,
  onCartSearchChange,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Foco automático na busca ao abrir a janela
  useEffect(() => {
    if (isOpen) {
      const timeoutId = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const summary = useMemo(() => getCartSummary(cartItems), [cartItems]);

  return (
    <CartModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Itens"
      titleId="cart-select-title"
      icon={<AddShoppingCartIcon className="cart-modal-icon" />}
      closeAriaLabel="Fechar janela de seleção de itens"
      summary={summary}
      footerLeft={
        summary.totalItems > 0 ? (
          <Button type="button" variant="secondary" size="sm" className={`${styles.cartManageBtn}`} onClick={onManageCart} leftIcon={<ShoppingCartIcon style={{ fontSize: '1rem' }} />}>
            Gerenciar
          </Button>
        ) : undefined
      }
    >
      {/* Corpo com busca e catálogo */}
      <div className={`${styles.cartCatalogSearch}`}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar produto ou serviço..."
          value={cartSearch}
          onChange={(e) => onCartSearchChange(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          className={`${styles.cartSearchInput}`}
        />
        {cartSearch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            className={`${styles.cartSearchClear}`}
            onClick={() => onCartSearchChange('')}
            aria-label="Limpar busca"
            leftIcon={<span>×</span>}
          />
        )}
      </div>

      <div className={`${styles.cartCatalogList}`}>
        {loadingCatalog ? (
          <div className={`${styles.cartCatalogEmpty}`}>Buscando itens...</div>
        ) : catalogItems.length === 0 ? (
          <div className={`${styles.cartCatalogEmpty}`}>Nenhum produto ou serviço encontrado</div>
        ) : (
          catalogItems.map((item) => {
            const inCart = cartItems.find((ci) => ci.id === item.id && ci.tipo === item.tipo);
            const hasInCart = Boolean(inCart && inCart.quantidade > 0);
            return (
              <div key={`${item.tipo}-${item.id}`} className={`${styles.cartCatalogItemRow}`}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconOnly
                  className={`${styles.cartBtnSub} ${!hasInCart ? 'disabled' : ''}`}
                  disabled={!hasInCart}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item);
                  }}
                  title={hasInCart ? 'Subtrair 1 unidade' : 'Item não está no carrinho'}
                  aria-label="Subtrair 1 unidade"
                  leftIcon={<span>-</span>}
                />

                <div className={`${styles.cartCatalogItem}`} onClick={() => onAddToCart(item)}>
                  <div className={`${styles.cartItemInfo}`}>
                    <span className={`${styles.cartItemName}`}>{item.nome}</span>
                    <div className={`${styles.cartItemMeta}`}>
                      <span className={`${styles.cartTypeBadge} ${item.tipo.toLowerCase()}`}>
                        {item.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                      </span>
                      {item.tipo === 'PRODUTO' && item.estoque !== undefined && (
                        <span className={`${styles.cartItemStock}`}>Est: {item.estoque}</span>
                      )}
                      {item.codigo_interno && (
                        <span className={`${styles.cartItemCode}`}>#{item.codigo_interno}</span>
                      )}
                    </div>
                  </div>
                  <div className={`${styles.cartItemPriceSection}`}>
                    <span className={`${styles.cartItemPrice}`}>
                      {formatCurrency(item.preco_venda ?? 0, 2)}
                    </span>
                    {hasInCart && (
                      <span className={`${styles.cartItemQtyBadge}`}>+{inCart?.quantidade}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
</CartModalShell>
  );
};

export default SelectItemsModal;