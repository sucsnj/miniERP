import { useState } from 'react';

// Hook que centraliza o estado e os controles de notificações (Toast).
// Evita repetir a lógica de abrir/fechar o Toast em cada componente que precisa exibir mensagens.
export const useToast = () => {
  // Controla se o toast está visível
  const [toastOpen, setToastOpen] = useState(false);
  // Mensagem exibida no toast
  const [toastMessage, setToastMessage] = useState('');
  // Tipo visual do toast: sucesso, erro ou informação
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  // Tempo (ms) até o toast fechar automaticamente; null = permanece aberto
  const [toastDuration, setToastDuration] = useState<number | null>(3000);

  // Exibe um toast definindo a mensagem, o tipo e a duração.
  // Padrões: tipo 'info' e duração de 3000ms (mesmo padrão do componente Toast).
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number | null = 3000) => {
    setToastMessage(message);
    setToastType(type);
    setToastDuration(duration);
    setToastOpen(true);
  };

  // Oculta o toast atual
  const closeToast = () => {
    setToastOpen(false);
  };

  return {
    toastOpen,
    toastMessage,
    toastType,
    toastDuration,
    showToast,
    closeToast,
  };
};