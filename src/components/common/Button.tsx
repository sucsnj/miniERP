import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/button.module.css';

type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'secondary'
  | 'outline'
  | 'ghost';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  iconOnly?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.primary,
  success: styles.success,
  danger: styles.danger,
  warning: styles.warning,
  info: styles.info,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      icon,
      isLoading = false,
      iconOnly = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const iconRef = useRef<HTMLSpanElement | null>(null);
    const [hideIcon, setHideIcon] = useState(false);
    const iconWidthRef = useRef(0);

    const resolvedLeftIcon = isLoading ? <span className={styles.spinner} aria-hidden="true" /> : (leftIcon ?? icon);
    const isIconOnly = iconOnly && Boolean(resolvedLeftIcon);

    const setRef = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    useEffect(() => {
      const button = buttonRef.current;
      if (!button || iconOnly) return;

      const evaluate = () => {
        if (!hideIcon) {
          if (button.scrollWidth > button.clientWidth + 1) {
            iconWidthRef.current = iconRef.current?.offsetWidth ?? 0;
            setHideIcon(true);
          }
        } else if (iconWidthRef.current > 0 && button.clientWidth >= button.scrollWidth + iconWidthRef.current + 8) {
          setHideIcon(false);
        }
      };

      const observer = new ResizeObserver(evaluate);
      observer.observe(button);
      evaluate();

      return () => observer.disconnect();
    }, [icon, leftIcon, rightIcon, children, isLoading, iconOnly, hideIcon]);

    const classes = [styles.button, variantClasses[variant], sizeClasses[size]];
    if (isIconOnly) classes.push(styles.iconOnly);
    if (className) classes.push(className);

    return (
      <button ref={setRef} className={classes.join(' ')} disabled={disabled || isLoading} aria-busy={isLoading} {...props}>
        {resolvedLeftIcon && (!hideIcon || isIconOnly) ? <span ref={iconRef} className={styles.icon}>{resolvedLeftIcon}</span> : null}
        {isIconOnly ? (
          children ? <span className={styles.srOnly}>{children}</span> : null
        ) : children ? (
          <span className={styles.label}>{children}</span>
        ) : null}
        {!isIconOnly && rightIcon ? <span className={styles.icon}>{rightIcon}</span> : null}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
