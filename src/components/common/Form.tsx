import React from 'react';
import styles from '../../styles/layout.module.css';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ children, className, ...props }, ref) => (
  <form ref={ref} className={className ? `${styles.form} ${className}` : styles.form} {...props}>
    {children}
  </form>
));

Form.displayName = 'Form';

export default Form;
