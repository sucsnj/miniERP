import React from 'react';
import styles from '../../styles/layout.module.css';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, children }) => (
  <div className={styles.field}>
    <label htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
);

export default FormField;
