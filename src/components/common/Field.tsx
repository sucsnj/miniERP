import React from 'react';
import styles from '../../styles/field.module.css';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, id, className, ...props }, ref) => {
    const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
        <input ref={ref} id={inputId} className={`${styles.input}${className ? ` ${className}` : ''}`} {...props} />
      </div>
    );
  },
);

Field.displayName = 'Field';

export default Field;
