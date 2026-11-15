import React, { useId } from 'react';
import styles from '../../styles/payables.module.css';

export type AccountInputType = 'text' | 'number' | 'date' | 'textarea';

interface AccountFieldProps {
  label: string;
  value: string;
  displayValue?: string;
  editable: boolean;
  canWrite?: boolean;
  onChange: (value: string) => void;
  onActivate?: () => void;
  inputType?: AccountInputType;
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  rows?: number;
  placeholder?: string;
}

const AccountField: React.FC<AccountFieldProps> = ({
  label,
  value,
  displayValue,
  editable,
  canWrite = true,
  onChange,
  onActivate,
  inputType = 'text',
  required = false,
  inputRef,
  rows = 4,
  placeholder,
}) => {
  const inputId = useId();

  const control = inputType === 'textarea' ? (
    <textarea
      id={inputId}
      ref={inputRef as React.RefObject<HTMLTextAreaElement | null>}
      className={styles.accountFieldControl}
      rows={rows}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  ) : (
    <input
      id={inputId}
      ref={inputRef as React.RefObject<HTMLInputElement | null>}
      className={styles.accountFieldControl}
      type={inputType}
      inputMode={inputType === 'number' ? 'decimal' : undefined}
      step={inputType === 'number' ? '0.01' : undefined}
      min={inputType === 'number' ? '0' : undefined}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );

  const canActivate = !editable && canWrite && Boolean(onActivate);
  const readValue = displayValue ?? value;

  return (
    <label className={styles.accountField} htmlFor={editable ? inputId : undefined}>
      <span className={styles.accountFieldLabel}>{label}</span>
      {editable ? control : (
        <button
          type="button"
          className={canActivate ? styles.accountFieldValue : styles.accountFieldValueDisabled}
          onClick={onActivate}
          disabled={!canActivate}
          aria-label={`${label}: ${readValue}`}
        >
          {readValue}
        </button>
      )}
    </label>
  );
};

export default AccountField;
