import { useEffect, useState, useRef } from 'react';
import Toast from './Toast';
import { registrarVenda, VendaDiaria } from '../services/vendasService';
import { Parser } from 'expr-eval';
import { formatCurrency } from '../utils/formatter';
import { parseCurrency } from '../utils/number';
import { useShortcuts } from '../utils/shortcuts';
import { validateRequired, validateCurrency, validateDate } from '../utils/validation';
import { highlightField } from '../utils/forms';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ModalCarrinho from './ModalCarrinho';
import ModalSelecionarItens from './ModalSelecionarItens';
import ModalPix from './ModalPix';
import { useCart } from '../hooks/useCart';
import { buildPixPayload } from '../utils/pix';

export interface CartItem {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  preco_venda: number;
  quantidade: number;
  codigo_interno?: string;
  referencia?: string;
  estoque?: number;
}

interface DailySaleFormProps {
  sales?: VendaDiaria[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaleAdded?: () => void;
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
  showHistory?: boolean;
}

const DailySaleForm: React.FC<DailySaleFormProps> = ({
  selectedDate,
  onDateChange,
  onSaleAdded,
}) => {
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [limpando] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastOpen, setToastOpen] = useState(false);
  const valorInputRef = useRef<HTMLInputElement | null>(null);
  const observacoesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [calculatedValue, setCalculatedValue] = useState<number | null>(0);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [pixAmount, setPixAmount] = useState<string | null>(null);

  // Exibe mensagem de sucesso, erro ou informação
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const closeToast = () => {
    setToastOpen(false);
  };

  // Estado e ações do carrinho (catálogo, seleção e gerenciamento), compartilhado
  // com o formulário de edição através do hook useCart
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
    closeCarrinho,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount,
    totalCartValue,
  } = useCart(showToast);

  // Constante com as teclas permitidas para o input de valor
  const allowedKeys = [
    "Backspace", "Delete", "Enter", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
  ];

  // Quando uma tecla é pressionada no input de valor, verifica se é permitida
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, currentTarget } = event;

    // Teclas permitidas: números, operadores matemáticos, parênteses, vírgula e ponto
    if (allowedKeys.includes(key)) return;
    if (/^[0-9]$/.test(key)) return;
    if (["+", "-", "*", "/", "(", ")", ".", ","].includes(key)) {
      const value = currentTarget.value;
      const lastChar = value.slice(-1);

      // Bloquear duplicação do mesmo símbolo
      if (lastChar === key) {
        event.preventDefault();
        return;
      }

      // Bloquear dois operadores diferentes seguidos (ex: "+*")
      if (/[+\-*/.,]/.test(lastChar) && /[+\-*/.,]/.test(key)) {
        event.preventDefault();
        return;
      }
      return;
    };

    // Bloquear qualquer outro caractere
    event.preventDefault();
  };

  // Calcula o valor do campo de valor
  const calculateValue = (input: string) => {
    if (!input.trim()) {
      setCalculatedValue(0);
      return;
    }
    try {
      // Substituir vírgulas por pontos para cálculo
      const expression = input.replace(/,/g, '.');
      const parser = new Parser();
      const result = parser.evaluate(expression);
      if (typeof result === 'number' && !isNaN(result)) {
        setCalculatedValue(result);
        return;
      }
    } catch {
      // Se erro, tentar remover o último operador
      try {
        let expression = input.replace(/,/g, '.');
        const lastChar = expression.slice(-1);
        if (/[+\-*/]$/.test(lastChar)) {
          expression = expression.slice(0, -1);
          const parser = new Parser();
          const result = parser.evaluate(expression);
          if (typeof result === 'number' && !isNaN(result)) {
            setCalculatedValue(result);
            return;
          }
        }
      } catch {
        // Ignorar
      }
    }
    setCalculatedValue(null);
  };

  const formatCartValue = (val: number): string => {
    return val.toFixed(2).replace('.', ',');
  };

  const prevCartValueRef = useRef<number>(0);

  // Sempre que o valor total do carrinho mudar, atualiza o campo input adicionando +valor_do_carrinho
  useEffect(() => {
    const prevCartVal = prevCartValueRef.current;
    if (prevCartVal === totalCartValue) return;

    const oldCartStr = prevCartVal > 0 ? formatCartValue(prevCartVal) : '';
    const newCartStr = totalCartValue > 0 ? formatCartValue(totalCartValue) : '';

    setValor((currentValor) => {
      let base = currentValor;

      if (oldCartStr) {
        if (currentValor.endsWith('+' + oldCartStr)) {
          base = currentValor.slice(0, -(oldCartStr.length + 1));
        } else if (currentValor.endsWith(oldCartStr)) {
          base = currentValor.slice(0, -oldCartStr.length);
        } else if (currentValor === oldCartStr) {
          base = '';
        }
      }

      let updatedValor = base;
      if (newCartStr) {
        const trimmedBase = base.trim();
        if (!trimmedBase) {
          updatedValor = newCartStr;
        } else if (/[+\-*/]$/.test(trimmedBase)) {
          updatedValor = trimmedBase + newCartStr;
        } else {
          updatedValor = trimmedBase + '+' + newCartStr;
        }
      }

      calculateValue(updatedValor);
      return updatedValor;
    });

    prevCartValueRef.current = totalCartValue;
  }, [totalCartValue]);

  // apagar se pressionar esc no teclado
  useShortcuts(['Escape'], () => {
    setCalculatedValue(0); // limpa o somatório
    setValor('');
    setCartItems([]);
    prevCartValueRef.current = 0;
  });

  // botão para limpar valor e observações
  const handleClear = () => {
    setCartItems([]);
    prevCartValueRef.current = 0;
    setValor('');
    setObservacoes('');
    setCalculatedValue(0);
    // manda o foco para o input de valor
    valorInputRef.current?.focus();
  };

  const handlePixClick = () => {
    const valorCheck = validateRequired(valor, 'Valor');
    if (!valorCheck.ok) {
      showToast(valorCheck.message ?? 'Informe o valor da venda.', 'error');
      valorInputRef.current?.focus();
      return;
    }

    const valueFromInput = parseCurrency(valor);
    if (valueFromInput == null) {
      showToast(validateCurrency(valor).message ?? 'Valor inválido.', 'error');
      valorInputRef.current?.focus();
      return;
    }

    if (valueFromInput < 0) {
      showToast('Não pode haver pix negativo.', 'info');
      highlightField(observacoesTextareaRef);
      setLoading(false);
      return;
    }

    const amount = valueFromInput > 0 ? valueFromInput.toFixed(2) : null;

    const pixKey = process.env.NEXT_PUBLIC_PIX_KEY ?? '';
    const merchantName = process.env.NEXT_PUBLIC_PIX_NAME ?? '';
    const merchantCity = process.env.NEXT_PUBLIC_PIX_CITY ?? '';

    if (!pixKey || !merchantName || !merchantCity) {
      showToast('Configuração PIX incompleta no .env', 'error');
      return;
    }

    const { payload } = buildPixPayload({
      pixKey,
      merchantName,
      merchantCity,
      amount,
    });

    setPixPayload(payload);
    setPixAmount(amount);
    setPixModalOpen(true);
    showToast('QR Code PIX gerado!', 'success');
  };

  // envia dados para o serviço de vendas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar data e valor antes de enviar (contrato ADR 0002)
      const dataCheck = validateDate(selectedDate);
      if (!dataCheck.ok) {
        showToast(dataCheck.message ?? 'Data inválida.', 'error');
        setLoading(false);
        return;
      }

      const valueFromInput = calculatedValue !== null ? calculatedValue : parseCurrency(valor);

      // Toast para o campo valor vazio
      const valorCheck = validateRequired(valor, 'Valor');
      if (!valorCheck.ok) {
        showToast(valorCheck.message ?? 'Informe o valor da venda.', 'error');
        highlightField(valorInputRef);
        setLoading(false);
        valorInputRef.current?.focus();
        return;
      }

      // Toast para o campo valor inválido (formato monetário digitado)
      if (valueFromInput == null) {
        highlightField(valorInputRef);
        showToast(validateCurrency(valor).message ?? 'Valor inválido.', 'error');
        setLoading(false);
        return;
      }

      // Se for 0 ou menos, pede o preenchimento do campo de observações
      if (observacoes.trim() === '' && valueFromInput <= 0) {
        showToast('Informe o motivo da venda.', 'info');
        highlightField(observacoesTextareaRef);
        setLoading(false);
        return;
      }

      // Registra a venda
      await registrarVenda(
        selectedDate,
        valueFromInput,
        observacoes,
        cartItems
      );

      if (formRef.current) {
        const top =
          formRef.current.getBoundingClientRect().top +
          window.scrollY -
          80;

        window.scrollTo({
          top,
          behavior: 'smooth',
        });
      }

      showToast(`Venda registrada com sucesso: R$ ${valueFromInput.toFixed(2)}`, 'success');
      setValor('');
      setObservacoes('');
      setCalculatedValue(0);
      setCartItems([]);
      prevCartValueRef.current = 0;
      valorInputRef.current?.focus();
      valorInputRef.current?.select();
      if (onSaleAdded) {
        onSaleAdded();
      }
    } catch {
      showToast('Erro ao registrar venda.', 'error');
    }
    setLoading(false);
  };

  // Trata de manter o input de valor visível a cada 3 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const input = valorInputRef.current;
      if (input) {
        const rect = input.getBoundingClientRect();

        const estaVisivel =
          rect.top >= 70 && // distancia do topo
          rect.bottom <= window.innerHeight;

        if (!estaVisivel) {
          input?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          valorInputRef.current?.focus({ preventScroll: true });
        }
      }
    }, 180000); // 3 minutos

    return () => clearInterval(interval);
  }, []);

  // Trás o foco para o input de venda a cada 1 minuto
  useEffect(() => {
    const interval = setInterval(() => {
      valorInputRef.current?.focus();
    }, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  const formRef = useRef<HTMLFormElement | null>(null);

  const addOperator = (operator: string) => {
    const novoValor = valor + operator;
    setValor(novoValor);
    calculateValue(novoValor);

    requestAnimationFrame(() => {
      valorInputRef.current?.focus();
    });
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="daily-sale-form">
        <h2>Registrar Venda Diária</h2>
        <div className="sale-form-grid">
          <div className="sale-form-fields">
            <label>
              {/* Data:  */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="flex-grow-data"
              />
            </label>
            <div className="math-buttons">
              <button
                type="button"
                className="math-button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('+')}
              >
                <span>+</span>
              </button>
              <button
                type="button"
                className="math-button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('-')}
              >
                <span>-</span>
              </button>
              <button
                type="button"
                className="math-button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('*')}
              >
                <span>×</span>
              </button>
              <button
                type="button"
                className="math-button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => addOperator('/')}
              >
                <span>÷</span>
              </button>
            </div>
            <label>
              {/* Valor: */}
              <div className="input-with-icon-wrapper">
                <input
                  ref={valorInputRef}
                  type="text"
                  onKeyDown={handleKeyDown}
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={valor}
                  onChange={(e) => {
                    // Limpa o input em caso de caracteres inválidos
                    const value = e.target.value.replace(/[^0-9+\-*/(),.]/g, "");
                    e.target.value = value;
                    setValor(e.target.value);
                    calculateValue(e.target.value);
                  }}
                  autoFocus
                  className="flex-grow-valor"
                  placeholder={'Valor'}
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
              </div>
              <span className="display-value">
                {/* botão para gerar qrcode pix */}
                <span className="pix-button" onClick={handlePixClick}>
                  <QrCode2Icon className="pix-icon" />
                </span>
                <span className="pix-button" onClick={handlePixClick}>
                  {formatCurrency(calculatedValue ?? 0, 2)}
                </span>
              </span>
            </label>
            <label>
              {/* Observações: */}
              <textarea
                value={observacoes}
                ref={observacoesTextareaRef}
                onChange={(e) => setObservacoes(e.target.value)}
                className="flex-grow-observacoes"
                placeholder={'Observações...'}
              />
            </label>
            <div className="buttons-wrapper">
              <button
                type="submit"
                className='register-button'
                disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
              <button
                type="button"
                className='clear-button'
                disabled={limpando}
                onClick={handleClear}>
                {limpando ? 'Limpando...' : 'Limpar'}
              </button>
            </div>
          </div>

        </div>
      </form>
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={closeToast} position="local-top-right" />
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
      <ModalCarrinho
        isOpen={cartModalOpen}
        onClose={closeCarrinho}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
      <ModalPix
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
        payload={pixPayload}
        merchantName={process.env.NEXT_PUBLIC_PIX_NAME ?? ''}
        merchantBank={process.env.NEXT_PUBLIC_PIX_BANK ?? ''}
        amount={pixAmount}
        pixKey={process.env.NEXT_PUBLIC_PIX_KEY ?? ''}
      />
      <style jsx>{`
        .daily-sale-form {
          position: relative;
        }

        .sale-form-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.1fr;
          gap: 24px;
          align-items: start;
          margin-top: 20px;
        }

        .sale-form-fields {
          display: grid;
          gap: 16px;
        }

        .sale-form-fields label,
        .recent-history {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sale-form-fields label input,
        .sale-form-fields label textarea {
          width: 100%;
          border-radius: 10px;
          border: 1px solid var(--border);
          padding: 10px 12px;
          font-size: 1rem;
        }

        .sale-form-fields {
          min-height: 110px;
          resize: vertical;
        }

        .sale-form-fields button {
          width: fit-content;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: var(--accent);
          color: var(--foreground);
          font-weight: 700;
          cursor: pointer;
        }

        .sale-form-fields button:disabled {
          background: var(--muted);
          cursor: not-allowed;
        }

        .input-with-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .input-with-icon-wrapper input {
          width: 100%;
          padding-right: 44px;
        }

        .sale-form-fields button.cart-icon-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 6px;
          margin: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--muted);
          border-radius: 8px;
          width: auto;
          min-width: unset;
          transition: color 0.2s ease, background-color 0.2s ease;
          color: #3ed955ff;
        }

        .sale-form-fields button.cart-icon-button:hover {
          color: var(--accent);
          background-color: var(--surface-soft, rgba(255, 255, 255, 0.08));
        }

        .cart-icon {
          font-size: 1.3rem;
        }

        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #3ed955;
          color: #000;
          font-size: 0.65rem;
          font-weight: 800;
          border-radius: 999px;
          min-width: 17px;
          height: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        }

        .flex-grow-1 {
          flex: 1;
        }

        .display-value {
          font-size: 1.9rem;
          font-weight: 700;
          min-width: 110px;
          text-align: right;
          margin-right: 10px;
          
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        /* estilo para deixar o botão clicável visualmente amigável */
        .pix-button {
          cursor: pointer;
          width: fit-content;
          height: fit-content;
          display: inline-flex;
          align-items: center;
        }

        .recent-history {
          padding: 16px;
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .recent-history h3 {
          margin: 0 0 12px;
          font-size: 18px;
        }

        .recent-history ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 12px;
        }

        .recent-sale-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          background: var(--surface-soft);
        }

        .recent-sale-observacoes {
          margin-top: 6px;
          color: var(--muted);
          font-size: 0.95rem;
        }

        .recent-sale-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .recent-sale-actions button {
          padding: 8px 12px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        .recent-sale-actions button:first-of-type {
          background: var(--surface-soft);
        }

        .recent-sale-actions button:last-of-type {
          background: var(--danger);
          color: var(--foreground);
        }

        .math-buttons {
          display: none;
        }

        .math-button {
          padding: 6px 10px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
        }

        @media (max-width: 900px) {
          .sale-form-grid {
            grid-template-columns: 1fr;
          }

          .display-value {
            font-size: 3.0rem;
          }

          .math-buttons {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default DailySaleForm;
