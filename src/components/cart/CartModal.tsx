/**
 * src/components/cart/CartModal.tsx
 *
 * Modal do carrinho de vendas. Apresentacional — sem estado próprio:
 * lógica fica no `useCart` (pai) e a casca visual no `CartModalShell`.
 * Estilos: classes globais `cart-modal-*` para o chrome e `<style jsx>`
 * local apenas para itens/quantidade/ações.
 * Ver docs/components/CartModal.md.
 */

import React, { useMemo } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatCurrency } from '../../utils/formatter';
import { getCartSummary } from '../../utils/cart';
import Button from '@/components/common/Button';
import { CartModalShell } from './CartModalShell';
import type { CartItem } from '../../types/sale';
import styles from '../../styles/cartModal.module.css';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, type: 'PRODUTO' | 'SERVICO', newQty: number) => void;
  onRemoveItem: (id: number, type: 'PRODUTO' | 'SERVICO') => void;
  onClearCart: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const summary = useMemo(() => getCartSummary(cartItems), [cartItems]);

  return (
    <CartModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Itens no Carrinho"
      titleId="cart-modal-title"
      icon={<ShoppingCartIcon className="cart-modal-icon" />}
      closeAriaLabel="Fechar modal de carrinho"
      summary={summary}
      footerLeft={
        cartItems.length > 0 ? (
          <Button type="button" variant="danger" size="sm" onClick={onClearCart} leftIcon={<DeleteIcon fontSize="small" />}>
            Limpar Carrinho
          </Button>
        ) : undefined
      }
    >
      {cartItems.length === 0 ? (
        <div className="cart-modal-empty">
          <ShoppingCartIcon style={{ fontSize: '3rem', opacity: 0.3 }} />
          <p>Seu carrinho está vazio.</p>
          <span>Selecione produtos ou serviços no formulário para adicionar.</span>
        </div>
      ) : (
        <div className={`${styles.cartItemsList}`}>
          {cartItems.map((item, index) => {
            const subtotal = (item.preco_venda ?? 0) * item.quantidade;
            return (
              <div className={`${styles.cartItemRow}`} key={`${item.tipo}-${item.id}-${index}`}>
                {/* Informações do Item */}
                <div className={`${styles.cartItemMain}`}>
                  <div className={`${styles.cartItemHeader}`}>
                    <span className={`${styles.cartItemName}`}>{item.nome}</span>
                    <span
                      className={`${styles.cartBadgeType} ${
                        item.tipo === 'PRODUTO' ? 'badge-produto' : 'badge-servico'
                      }`}
                    >
                      {item.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                    </span>
                  </div>
                  <div className={`${styles.cartItemDetails}`}>
                    {item.codigo_interno && (
                      <span className="cart-item-code">#{item.codigo_interno}</span>
                    )}
                    <span className="cart-item-unit-price">
                      {formatCurrency(item.preco_venda ?? 0, 2)} / un
                    </span>
                  </div>
                </div>

                {/* Controles de Quantidade, Subtotal e Remoção */}
                <div className={`${styles.cartItemActions}`}>
                  <div className={`${styles.cartQtyControl}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconOnly
                      className={`${styles.qtyBtn}`}
                      onClick={() => onUpdateQuantity(item.id, item.tipo, item.quantidade - 1)}
                      title="Diminuir quantidade"
                      aria-label="Diminuir quantidade"
                      leftIcon={<RemoveIcon fontSize="inherit" />}
                    />
                    <input
                      type="number"
                      min="1"
                      className={`${styles.qtyInput}`}
                      value={item.quantidade}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          onUpdateQuantity(item.id, item.tipo, val);
                        }
                      }}
                      aria-label={`Quantidade de ${item.nome}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconOnly
                      className={`${styles.qtyBtn}`}
                      onClick={() => onUpdateQuantity(item.id, item.tipo, item.quantidade + 1)}
                      title="Aumentar quantidade"
                      aria-label="Aumentar quantidade"
                      leftIcon={<AddIcon fontSize="inherit" />}
                    />
                  </div>

                  <div className={`${styles.cartItemSubtotalBox}`}>
                    <span className={`${styles.subtotalVal}`}>{formatCurrency(subtotal, 2)}</span>
                  </div>

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    iconOnly
                    className={`${styles.cartRemoveBtn}`}
                    onClick={() => onRemoveItem(item.id, item.tipo)}
                    title="Remover item do carrinho"
                    aria-label={`Remover ${item.nome}`}
                    leftIcon={<DeleteIcon fontSize="small" />}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
</CartModalShell>
  );
};

export default CartModal;