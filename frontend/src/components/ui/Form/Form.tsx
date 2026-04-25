import { useState } from 'react';

import type { ChangeEvent, SubmitEvent } from 'react';
import S from './Form.module.css';
import Input from '../Input/Input';
import type {
  FormProps,
  FormData,
  FormErrors,
  SubmitMessage,
  ValidationRule,
  FormFieldValue
} from '../../../types'

const Form = ({
  fields,
  initialData,
  validationRules,
  onSubmit,
  submitButtonText = 'Отправить',
  title,
  columns = 1,
  alternateActionText,
  onAlternateAction,
  showAlternateAction = false,
  serverError
}: FormProps) => {

  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>({ type: '', text: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Обработка разных типов полей
    let fieldValue: FormFieldValue = value;
    if (type === 'number') {
      fieldValue = value === '' ? '' : Number(value);
    }

    setFormData((prev: FormData) => ({
      ...prev,
      [name]: fieldValue
    }));

    if (errors[name]) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const rule: ValidationRule = validationRules[fieldName];
      const value = formData[fieldName];

      if (rule.required && rule.validate) {
        const error = rule.validate(value, formData);
        if (error) {
          newErrors[fieldName] = error;
        }
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const result = await onSubmit(formData);

      const successMessage = result && typeof result === 'object' && 'message' in result
        ? String(result.message)
        : 'Форма успешно отправлена!';

      setSubmitMessage({
        type: 'success',
        text: successMessage
      });

      // Очистка формы после успешной отправки
      setFormData(initialData);

    } catch (error: unknown) {
      let errorMessage = 'Произошла ошибка при отправке';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setSubmitMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsByColumn = (): typeof fields[] => {
    if (columns === 1) {
      return [fields];
    }

    const columnsArray: typeof fields[] = Array.from({ length: columns }, () => []);
    fields.forEach((field, index) => {
      const columnIndex = index % columns;
      columnsArray[columnIndex].push(field);
    });

    return columnsArray;
  };

  const fieldColumns = getFieldsByColumn();

  return (
    <div className={S.formWrapper}>
      {title && <h2 className={S.title}>{title}</h2>}

      {serverError && (
        <div className={S.error}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className={S.form} noValidate>

        <div className={`${S.columns} ${S[`columns-${columns}`]}`}>
          {fieldColumns.map((columnFields, columnIndex) => (
            <div key={columnIndex} className={S.columns}>
              {columnFields.map(field => (
                <Input
                  key={field.name}
                  name={field.name}
                  type={field.type}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  errors={errors}
                  handleChange={handleChange}
                  isSubmitting={isSubmitting}
                  required={validationRules[field.name]?.required || false}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={S.actions}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={S.submitButton}
          >
            {isSubmitting ? 'Отправка...' : submitButtonText}
          </button>

          {showAlternateAction && onAlternateAction && (
            <button
              type="button"
              onClick={onAlternateAction}
              className={S.alternateButton}
              disabled={isSubmitting}
            >
              {alternateActionText}
            </button>
          )}
        </div>

        {submitMessage.text && (
          <div className={`${S.message} ${S[submitMessage.type]}`}>
            {submitMessage.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default Form;