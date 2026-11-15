import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/payables.module.css';
import Button from '@/components/common/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export type AccountInlineFieldType = 'text' | 'number' | 'date' | 'textarea';

interface InlineAccountFieldProps {
  fieldId: string;
  label: string;
  value: string;
  displayValue?: string;
  inputType?: AccountInlineFieldType;
  required?: boolean;
  canWrite?: boolean;
  rows?: number;
  placeholder?: string;
  activeFieldId: string | null;
  onActiveFieldChange: (fieldId: string | null) => void;
  onSave: (value: string) => Promise<boolean>;
}

const InlineAccountField: React.FC<InlineAccountFieldProps> = ({
  fieldId,
  label,
  value,
  displayValue,
  inputType = 'text',
  required = false,
  canWrite = true,
  rows = 4,
  placeholder,
  activeFieldId,
  onActiveFieldChange,
  onSave,
}) => {
  const editing = activeFieldId === fieldId;
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editing) return;

    const animationFrame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(animationFrame);
  }, [editing]);

  const startEditing = () => {
    if (!canWrite) return;
    setDraft(value);
    onActiveFieldChange(fieldId);
  };

  const save = async () => {
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);

    if (ok) onActiveFieldChange(null);
  };

  const cancel = () => {
    setDraft(value);
    onActiveFieldChange(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancel();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      void save();
    }
  };

  const control = inputType === 'textarea' ? (
    <textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement | null>}
      className={styles.accountInlineControl}
      rows={rows}
      required={required}
      value={draft}
      disabled={saving}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      aria-label={label}
    />
  ) : (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement | null>}
      className={styles.accountInlineControl}
      type={inputType}
      inputMode={inputType === 'number' ? 'decimal' : undefined}
      step={inputType === 'number' ? '0.01' : undefined}
      min={inputType === 'number' ? '0' : undefined}
      required={required}
      value={draft}
      disabled={saving}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      aria-label={label}
    />
  );

  return (
    <div className={styles.accountField}>
      <span className={styles.accountFieldLabel}>{label}</span>
      {editing ? (
        <div className={styles.accountInlineControlWrap}>
          {control}
          <Button
            type="button"
            variant="success"
            size="sm"
            iconOnly
            disabled={saving}
            onClick={() => void save()}
            aria-label={`Salvar ${label}`}
            title="Salvar"
            leftIcon={<CheckIcon fontSize="small" />}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            className={styles.accountInlineCancel}
            disabled={saving}
            onClick={cancel}
            aria-label={`Cancelar edição de ${label}`}
            title="Cancelar"
            leftIcon={<CloseIcon fontSize="small" />}
          />
        </div>
      ) : (
        <button
          type="button"
          className={canWrite ? styles.accountFieldValue : styles.accountFieldValueDisabled}
          onClick={startEditing}
          disabled={!canWrite}
          aria-label={`${label}: ${displayValue ?? value}`}
        >
          {displayValue ?? value}
        </button>
      )}
    </div>
  );
};

export default InlineAccountField;
