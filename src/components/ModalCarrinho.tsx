import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatCurrency } from '../utils/formatter';
import { useFocusTrap } from '../utils/focus';
import { CartItem } from './DailySaleForm';

interface ModalCarrinhoProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, tipo: 'PRODUTO' | 'SERVICO', newQty: number) => void;
  onRemoveItem: (id: number, tipo: 'PRODUTO' | 'SERVICO') => void;
  onClearCart: () => void;
}

const ModalCarrinho: React.FC<ModalCarrinhoProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen);

  // Fecha com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantidade, 0);
  const totalValue = cartItems.reduce(
    (acc, curr) => acc + (curr.preco_venda ?? 0) * curr.quantidade,
    0
  );

  const modalContent = (
    <div
      className="cart-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="cart-modal-container"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div className="cart-modal-header">
          <div className="cart-modal-title-group">
            <ShoppingCartIcon className="cart-modal-icon" />
            <h3 id="cart-modal-title">Itens no Carrinho</h3>
            {totalItems > 0 && (
              <span className="cart-modal-count-badge">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
          <button
            type="button"
            className="cart-modal-close-btn"
            onClick={onClose}
            aria-label="Fechar modal de carrinho"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Corpo do Modal com Rolagem Completa */}
        <div className="cart-modal-body">
          {cartItems.length === 0 ? (
            <div className="cart-modal-empty">
              <ShoppingCartIcon style={{ fontSize: '3rem', opacity: 0.3 }} />
              <p>Seu carrinho está vazio.</p>
              <span>Selecione produtos ou serviços no formulário para adicionar.</span>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item, index) => {
                const subtotal = (item.preco_venda ?? 0) * item.quantidade;
                return (
                  <div className="cart-item-row" key={`${item.tipo}-${item.id}-${index}`}>
                    {/* Informações do Item */}
                    <div className="cart-item-main">
                      <div className="cart-item-header">
                        <span className="cart-item-name">{item.nome}</span>
                        <span
                          className={`cart-badge-type ${
                            item.tipo === 'PRODUTO' ? 'badge-produto' : 'badge-servico'
                          }`}
                        >
                          {item.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                        </span>
                      </div>
                      <div className="cart-item-details">
                        {item.codigo_interno && (
                          <span className="cart-item-code">#{item.codigo_interno}</span>
                        )}
                        <span className="cart-item-unit-price">
                          {formatCurrency(item.preco_venda ?? 0, 2)} / un
                        </span>
                      </div>
                    </div>

                    {/* Controles de Quantidade, Subtotal e Remoção */}
                    <div className="cart-item-actions">
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.tipo, item.quantidade - 1)
                          }
                          title="Diminuir quantidade"
                          aria-label="Diminuir quantidade"
                        >
                          <RemoveIcon fontSize="inherit" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          className="qty-input"
                          value={item.quantidade}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) {
                              onUpdateQuantity(item.id, item.tipo, val);
                            }
                          }}
                          aria-label={`Quantidade de ${item.nome}`}
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.tipo, item.quantidade + 1)
                          }
                          title="Aumentar quantidade"
                          aria-label="Aumentar quantidade"
                        >
                          <AddIcon fontSize="inherit" />
                        </button>
                      </div>

                      <div className="cart-item-subtotal-box">
                        <span className="subtotal-val">{formatCurrency(subtotal, 2)}</span>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => onRemoveItem(item.id, item.tipo)}
                        title="Remover item do carrinho"
                        aria-label={`Remover ${item.nome}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé Fixo */}
        <div className="cart-modal-footer">
          <div className="cart-modal-footer-left">
            {cartItems.length > 0 && (
              <button
                type="button"
                className="cart-clear-all-btn"
                onClick={onClearCart}
              >
                <DeleteIcon fontSize="small" />
                Limpar Carrinho
              </button>
            )}
          </div>

          <div className="cart-modal-footer-right">
            <div className="cart-modal-total-summary">
              <span className="total-label">Total:</span>
              <span className="total-amount">{formatCurrency(totalValue, 2)}</span>
            </div>
            <button
              type="button"
              className="cart-modal-close-action-btn"
              onClick={onClose}
            >
              Concluir
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cart-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 16px;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .cart-modal-container {
          background: var(--surface, #1e1e1e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          width: 100%;
          max-width: 720px;
          height: min(85vh, 600px);
          max-height: calc(100vh - 32px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          animation: modalFadeIn 0.2s ease-out;
          outline: none;
          overflow: hidden;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .cart-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border, #333);
          background: var(--surface, #1e1e1e);
          flex-shrink: 0;
        }

        .cart-modal-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cart-modal-title-group :global(.cart-modal-icon) {
          color: #3ed955;
          font-size: 1.6rem;
        }

        .cart-modal-title-group h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--foreground);
          font-weight: 700;
        }

        .cart-modal-count-badge {
          background: var(--surface-soft, rgba(255, 255, 255, 0.08));
          color: var(--muted);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 12px;
          border: 1px solid var(--border, #444);
        }

        .cart-modal-close-btn {
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }

        .cart-modal-close-btn:hover {
          background: var(--surface-soft, rgba(255, 255, 255, 0.1));
          color: var(--foreground);
        }

        /* Corpo do Modal */
        .cart-modal-body {
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px 20px;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }

        .cart-modal-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: var(--muted);
          gap: 8px;
          height: 100%;
        }

        .cart-modal-empty p {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: var(--foreground);
        }

        .cart-modal-empty span {
          font-size: 0.85rem;
        }

        /* Lista de Itens */
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 8px;
        }

        .cart-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: var(--surface-soft, rgba(255, 255, 255, 0.04));
          border: 1px solid var(--border, #2a2a2a);
          border-radius: 12px;
          gap: 12px;
          transition: border-color 0.2s;
        }

        .cart-item-row:hover {
          border-color: var(--border, #444);
        }

        .cart-item-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .cart-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .cart-item-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--foreground);
          word-break: break-word;
        }

        .cart-item-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--muted);
        }

        .cart-badge-type {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge-produto {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .badge-servico {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .cart-qty-control {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          background: var(--background, #121212);
          border: 1px solid var(--border, #444);
          border-radius: 8px;
          padding: 2px;
          width: fit-content;
        }

        .qty-btn {
          background: transparent;
          border: none;
          color: var(--foreground);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 6px;
          font-size: 0.85rem;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
        }

        .qty-btn:hover {
          background: var(--surface-soft, rgba(255, 255, 255, 0.1));
          color: #3ed955;
        }

        .qty-input {
          width: 36px;
          text-align: center;
          background: transparent;
          border: none;
          color: var(--foreground);
          font-weight: 700;
          font-size: 0.9rem;
          outline: none;
          -moz-appearance: textfield;
        }

        .qty-input::-webkit-outer-spin-button,
        .qty-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .cart-item-subtotal-box {
          min-width: 80px;
          text-align: right;
        }

        .subtotal-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #3ed955;
        }

        .cart-remove-btn {
          background: transparent;
          border: none;
          color: var(--danger, #ef4444);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, transform 0.1s;
        }

        .cart-remove-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          transform: scale(1.1);
        }

        /* Rodapé Fixo */
        .cart-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-top: 1px solid var(--border, #333);
          background: var(--surface, #1e1e1e);
          gap: 16px;
          flex-shrink: 0;
        }

        .cart-modal-footer-left {
          display: flex;
          align-items: center;
        }

        .cart-clear-all-btn {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.2s, border-color 0.2s;
        }

        .cart-clear-all-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: #ef4444;
        }

        .cart-modal-footer-right {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: auto;
        }

        .cart-modal-total-summary {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .total-label {
          color: var(--muted);
          font-size: 0.95rem;
        }

        .total-amount {
          font-size: 1.3rem;
          font-weight: 800;
          color: #3ed955;
        }

        .cart-modal-close-action-btn {
          background: #3ed955;
          color: #000;
          border: none;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 9px 22px;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }

        .cart-modal-close-action-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Responsividade para telas menores (<= 640px) */
        @media (max-width: 640px) {
          .cart-modal-overlay {
            padding: 10px;
          }

          .cart-modal-container {
            height: min(90vh, 600px);
            max-height: calc(100vh - 20px);
          }

          .cart-modal-header {
            padding: 12px 14px;
          }

          .cart-modal-body {
            padding: 12px 10px;
          }

          .cart-item-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 10px 12px;
          }

          .cart-item-actions {
            justify-content: space-between;
            width: 100%;
            padding-top: 8px;
            border-top: 1px dashed var(--border, #2a2a2a);
          }

          .cart-modal-footer {
            padding: 12px 14px;
            flex-direction: column;
            gap: 10px;
          }

          .cart-modal-footer-left {
            width: 100%;
          }

          .cart-clear-all-btn {
            width: 100%;
            justify-content: center;
          }

          .cart-modal-footer-right {
            width: 100%;
            justify-content: space-between;
            margin-left: 0;
          }

          .total-amount {
            font-size: 1.15rem;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ModalCarrinho;
