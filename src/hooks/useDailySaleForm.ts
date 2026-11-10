/**
 * src/hooks/useDailySaleForm.ts
 *
 * Estado, validação, ações e efeitos do formulário de venda diária
 * (extraídos de `DailySaleForm`, na refatoração dos componentes grandes —
 * ver docs/ALIGNMENT.md e hooks/Hooks.md).
 *
 * O componente `DailySaleForm` ficou apresentacional: este hook concentra
 * toda a regra e retorna os valores/callbacks que o JSX consome.
 */

import { useEffect, useRef, useState } from 'react';
import { registerSale } from '../services/vendasService';
import { useShortcuts } from '../utils/shortcuts';
import {
  validateRequired,
  validateCurrency,
  validateDate,
} from '../utils/validation';
import { highlightField } from '../utils/forms';
import { parseCurrency } from '../utils/number';
import { buildPixPayload } from '../utils/pix';
import { calculateResult, sanitizeExpression, insertKey } from '@/lib/calc/calculator';
import { useCart } from './useCart';
import { useToast } from './useToast';

// Teclas de navegação/edição sempre permitidas no campo de valor
const ALLOWED_SALE_KEYS = [
  'Backspace',
  'Delete',
  'Enter',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
];

interface UseDailySaleFormProps {
  selectedDate: string;
  onSaleAdded?: () => void;
}

export const useDailySaleForm = ({
  selectedDate,
  onSaleAdded,
}: UseDailySaleFormProps) => {
  const { showToast } = useToast();

  const [value, setValue] = useState('');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [isValueInvalid, setIsValueInvalid] = useState(false);
  const [calculatedValue, setCalculatedValue] = useState<number | null>(0);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [pixAmount, setPixAmount] = useState<string | null>(null);

  const valueInputRef = useRef<HTMLInputElement | null>(null);
  const observationsTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const prevCartValueRef = useRef<number>(0);

  // Estado e ações do carrinho (catálogo, seleção e gerenciamento), compartilhado
  // com o formulário de edição através do hook useCart
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
    closeCartModal,
    handleManageCart,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    totalCartCount,
    totalCartValue,
  } = useCart(showToast);

  // Aplica/limpa o somatório do campo de valor a partir da expressão digitada
  const calculateValue = (input: string) => {
    const result = calculateResult(input);
    setCalculatedValue(result);
    setIsValueInvalid(input.trim() !== '' && result === null);
  };

  // Filtra as teclas do input de valor: números, operadores matemáticos,
  // parênteses, vírgula/ponto e teclas de navegação
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;

    if (ALLOWED_SALE_KEYS.includes(key)) return;
    if (key.length !== 1) {
      event.preventDefault();
      return;
    }

    const nextValue = insertKey(value, key);
    if (nextValue === value) {
      event.preventDefault();
      return;
    }
  };

  // Sanitiza o input de valor e recalcula a expressão
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cursor = event.target.selectionStart ?? event.target.value.length;
    const sanitizedBefore = sanitizeExpression(event.target.value.slice(0, cursor));
    const sanitized = sanitizeExpression(event.target.value);
    event.target.value = sanitized;
    setValue(sanitized);
    calculateValue(sanitized);

    requestAnimationFrame(() => {
      const position = Math.min(sanitizedBefore.length, sanitized.length);
      valueInputRef.current?.setSelectionRange(position, position);
    });
  };

  const formatCartValue = (val: number): string => val.toFixed(2);

  // Sempre que o valor total do carrinho mudar, atualiza o campo input
  // adicionando/removendo "+valor_do_carrinho"
  useEffect(() => {
    const prevCartVal = prevCartValueRef.current;
    if (prevCartVal === totalCartValue) return;

    const oldCartStr = prevCartVal > 0 ? formatCartValue(prevCartVal) : '';
    const newCartStr = totalCartValue > 0 ? formatCartValue(totalCartValue) : '';

    setValue((currentValue) => {
      let base = currentValue;

      if (oldCartStr) {
        if (currentValue.endsWith('+' + oldCartStr)) {
          base = currentValue.slice(0, -(oldCartStr.length + 1));
        } else if (currentValue.endsWith(oldCartStr)) {
          base = currentValue.slice(0, -oldCartStr.length);
        } else if (currentValue === oldCartStr) {
          base = '';
        }
      }

      let updatedValue = base;
      if (newCartStr) {
        const trimmedBase = base.trim();
        if (!trimmedBase) {
          updatedValue = newCartStr;
        } else if (/[+\-*/]$/.test(trimmedBase)) {
          updatedValue = trimmedBase + newCartStr;
        } else {
          updatedValue = trimmedBase + '+' + newCartStr;
        }
      }

      calculateValue(updatedValue);
      return updatedValue;
    });

    prevCartValueRef.current = totalCartValue;
  }, [totalCartValue]);

  // Apaga tudo ao pressionar ESC no teclado
  useShortcuts(['Escape'], () => {
    setCalculatedValue(0);
    setIsValueInvalid(false);
    setValue('');
    setCartItems([]);
    prevCartValueRef.current = 0;
  });

  // Botão para limpar valor e observações (foco volta para o input de valor)
  const handleClear = () => {
    setClearing(true);
    setCartItems([]);
    prevCartValueRef.current = 0;
    setValue('');
    setObservations('');
    setCalculatedValue(0);
    setIsValueInvalid(false);
    valueInputRef.current?.focus();
    setClearing(false);
  };

  const handlePixClick = () => {
    const valueCheck = validateRequired(value, 'Valor');
    if (!valueCheck.ok) {
      showToast(valueCheck.message ?? 'Informe o valor da venda.', 'error');
      valueInputRef.current?.focus();
      return;
    }

    const valueFromInput = parseCurrency(value);
    if (valueFromInput == null) {
      showToast(validateCurrency(value).message ?? 'Valor inválido.', 'error');
      valueInputRef.current?.focus();
      return;
    }

    if (valueFromInput < 0) {
      showToast('Não pode haver pix negativo.', 'info');
      highlightField(observationsTextareaRef);
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

  // Envia os dados para o serviço de vendas
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Validar data e valor antes de enviar (contrato ADR 0002)
      const dateCheck = validateDate(selectedDate);
      if (!dateCheck.ok) {
        showToast(dateCheck.message ?? 'Data inválida.', 'error');
        setLoading(false);
        return;
      }

      const valueFromInput =
        calculatedValue !== null ? calculatedValue : parseCurrency(value);

      if (value.trim() !== '' && calculatedValue === null) {
        highlightField(valueInputRef);
        showToast('Expressão inválida.', 'error');
        setLoading(false);
        valueInputRef.current?.focus();
        return;
      }

      const valueCheck = validateRequired(value, 'Valor');
      if (!valueCheck.ok) {
        showToast(valueCheck.message ?? 'Informe o valor da venda.', 'error');
        highlightField(valueInputRef);
        setLoading(false);
        valueInputRef.current?.focus();
        return;
      }

      if (valueFromInput == null) {
        highlightField(valueInputRef);
        showToast(validateCurrency(value).message ?? 'Valor inválido.', 'error');
        setLoading(false);
        return;
      }

      // Se for 0 ou menos, pede o preenchimento do campo de observações
      if (observations.trim() === '' && valueFromInput <= 0) {
        showToast('Informe o motivo da venda.', 'info');
        highlightField(observationsTextareaRef);
        setLoading(false);
        return;
      }

      // Registra a venda
      await registerSale(selectedDate, valueFromInput, observations, cartItems);

      if (formRef.current) {
        const top =
          formRef.current.getBoundingClientRect().top + window.scrollY - 80;

        window.scrollTo({
          top,
          behavior: 'smooth',
        });
      }

      showToast(
        `Venda registrada com sucesso: R$ ${valueFromInput.toFixed(2)}`,
        'success'
      );
      setValue('');
      setObservations('');
      setCalculatedValue(0);
      setCartItems([]);
      prevCartValueRef.current = 0;
      valueInputRef.current?.focus();
      valueInputRef.current?.select();
      if (onSaleAdded) {
        onSaleAdded();
      }
    } catch {
      showToast('Erro ao registrar venda.', 'error');
    }
    setLoading(false);
  };

  // Mantém o input de valor visível a cada 3 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const input = valueInputRef.current;
      if (input) {
        const rect = input.getBoundingClientRect();
        const isVisible =
          rect.top >= 70 && // distância do topo
          rect.bottom <= window.innerHeight;

        if (!isVisible) {
          input?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          valueInputRef.current?.focus({ preventScroll: true });
        }
      }
    }, 180000); // 3 minutos

    return () => clearInterval(interval);
  }, []);

  // Traz o foco para o input de venda a cada 1 minuto
  useEffect(() => {
    const interval = setInterval(() => {
      valueInputRef.current?.focus();
    }, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  // Adiciona um operador matemático ao campo de valor
  const addOperator = (operator: string) => {
    const nextValue = insertKey(value, operator);
    setValue(nextValue);
    calculateValue(nextValue);

    requestAnimationFrame(() => {
      valueInputRef.current?.focus();
    });
  };

  return {
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
  };
};