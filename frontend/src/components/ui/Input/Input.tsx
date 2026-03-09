import S from './Input.module.css';
import type { InputProps, FormFieldValue } from '../../../types';

const Input = ({
    type = 'text',
    name,
    label,
    value,
    placeholder = '',
    errors,
    handleChange,
    isSubmitting,
    required
  }: InputProps) => {
  
  const errorMessage = errors[name];
  const hasError = !!errorMessage;

  // Преобразуем value в строку для input
  const getInputValue = (val: FormFieldValue): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string') return val;
    return String(val);
  };

  const inputValue = getInputValue(value);

  // Обработка разных типов полей
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            disabled={isSubmitting}
            className={S.input}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        );
      
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={inputValue}
            onChange={handleChange}
            disabled={isSubmitting}
            className={S.input}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          >
            <option value="">Выберите...</option>
            {/* Здесь должны быть options из props */}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={!!value}
            onChange={handleChange}
            disabled={isSubmitting}
            className={S.checkbox}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        );
      
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            disabled={isSubmitting}
            className={S.input}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        );
    }
  };

  return (
    <div className={`${S.formGroup} ${hasError ? S.error : ''}`}>
      <label htmlFor={name} className={S.label}>
        {label} {required && <span className={S.required}>*</span>}
      </label>
      
      {renderInput()}
      
      {hasError && (
        <span id={`${name}-error`} className={S.errorMessage}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default Input;