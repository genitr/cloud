import S from './Button.module.css';
import type { ButtonProps } from '../../../types';

const Button = ({ 
  children, 
  onClick,
  size = 'medium',     // 'small', 'medium', 'large'
  disabled = false,
  className = '',
  iconLeft,
  iconRight,
  type = 'button',
  ...props 
}: ButtonProps) => {
  const buttonClasses = [
    S.button,
    S[size],
    disabled ? S.disabled : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {iconLeft && <span className={`${S.icon} ${S.iconLeft}`}>{iconLeft}</span>}
      {children}
      {iconRight && <span className={`${S.icon} ${S.iconRight}`}>{iconRight}</span>}
    </button>
  );
};

export default Button;