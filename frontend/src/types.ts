import type { ReactNode, ButtonHTMLAttributes, SVGAttributes, ChangeEvent  } from 'react';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

// Типы для иконок
export type IconName = 
  | 'home'
  | string; // Временно, пока не добавлены все типы

export type IconFlip = 'horizontal' | 'vertical';

export interface IconProps extends SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  spin?: boolean;
  rotate?: number;
  flip?: IconFlip;
  title?: string;
  disabled?: boolean;
  children?: ReactNode;
}

// Интерфейс для всех иконок
export interface IconBaseProps extends SVGAttributes<SVGElement> {
  size?: number;
  strokeColor?: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onClick?: () => void;
}

// Тип для компонента иконки
export type IconComponent = React.ForwardRefExoticComponent<IconBaseProps & React.RefAttributes<SVGSVGElement>>;

// Типы для полей формы
export type FieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';

export type FormFieldValue = string | number | boolean | readonly string[] | undefined;

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule;
}

export interface ValidationRule {
  required?: boolean;
  validate?: (value: FormFieldValue, formData: Record<string, FormFieldValue>) => string | undefined;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormData {
  [key: string]: FormFieldValue;
}

export interface FormErrors {
  [key: string]: string;
}

export interface SubmitMessage {
  type: 'success' | 'error' | '';
  text: string;
}

export interface SubmitResult {
  message?: string;
  [key: string]: unknown;
}

export interface FormProps {
  fields: FormField[];
  initialData: FormData;
  validationRules: ValidationRules;
  onSubmit: (data: FormData) => Promise<SubmitResult | void>;
  submitButtonText?: string;
  title?: string;
  columns?: 1 | 2 | 3;
  alternateActionText?: string;
  onAlternateAction?: () => void;
  showAlternateAction?: boolean;
  serverError?: string | null;
}

// Интерфейс для пропсов Input
export interface InputProps {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  value: FormFieldValue;
  errors: FormErrors;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
  required?: boolean;
}

// Типы для аутентификации
export interface LoginData extends FormData {
  login: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData extends FormData {
  login: string;
  password: string;
}

export interface RegistrationData extends FormData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  message?: string;
  data?: {
    token?: string;
  };
  [key: string]: unknown;
}

export interface NavigationState {
  state?: {
    message?: string;
  };
}
