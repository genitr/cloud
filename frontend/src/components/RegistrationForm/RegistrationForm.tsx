import { useNavigate } from 'react-router-dom';
import Form from '../ui/Form/Form';
import { 
  validateLogin, validatePassword, validateConfirmPassword,
  validateEmail, validateFirstName, validateLastName
} from '../../utils/validation';
import authService from '../../services/authService';
import type { 
  RegistrationData, 
  AuthResponse, 
  NavigationState, 
  FormFieldValue, 
  FormData as FormDataType 
} from '../../types';

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    { name: 'login', type: 'text' as const, label: 'Логин', placeholder: 'Введите логин' },
    { name: 'email', type: 'email' as const, label: 'Почта', placeholder: 'Введите почту' },
    { name: 'password', type: 'password' as const, label: 'Пароль', placeholder: 'Введите пароль' },
    { name: 'confirmPassword', type: 'password' as const, label: 'Подтверждение пароля', placeholder: 'Подтвердите пароль' },
    { name: 'firstName', type: 'text' as const, label: 'Имя', placeholder: 'Введите имя' },
    { name: 'lastName', type: 'text' as const, label: 'Фамилия', placeholder: 'Введите фамилию' },
  ];

  const initialData: RegistrationData = {
    login: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: ''
  };

  const validationRules = {
    login: {
      required: true,
      validate: (value: FormFieldValue): string | undefined => {
        return validateLogin(value as string);
      }
    },
    password: {
      required: true,
      validate: (value: FormFieldValue): string | undefined => {
        return validatePassword(value as string);
      }
    },
    confirmPassword: {
      required: true,
      validate: (value: FormFieldValue, formData: Record<string, FormFieldValue>): string | undefined => {
        const password = formData.password as string;
        return validateConfirmPassword(password, value as string);
      }
    },
    firstName: {
      required: false,
      validate: (value: FormFieldValue): string | undefined => {
        return validateFirstName(value as string);
      }
    },
    lastName: {
      required: false,
      validate: (value: FormFieldValue): string | undefined => {
        return validateLastName(value as string);
      }
    },
    email: {
      required: true,
      validate: (value: FormFieldValue): string | undefined => {
        return validateEmail(value as string);
      }
    }
  };

  const handleSubmit = async (formData: FormDataType): Promise<AuthResponse | void> => {
    try {
      // Приводим FormData к RegistrationData
      const registrationData: RegistrationData = {
        login: String(formData.login || ''),
        email: String(formData.email || ''),
        password: String(formData.password || ''),
        confirmPassword: String(formData.confirmPassword || ''),
        firstName: formData.firstName ? String(formData.firstName) : '',
        lastName: formData.lastName ? String(formData.lastName) : ''
      };

      const result = await authService.register(registrationData);
      console.log('Registration successful:', result);
      
      const navigationState: NavigationState = { 
        state: { message: 'Регистрация успешна! Теперь войдите в систему.' }
      };
      
      navigate('/login', navigationState);
      
      return result;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(String(error.message));
      }
      throw new Error('Ошибка при регистрации');
    }
  };

  const handleLoginClick = (): void => {
    navigate('/login');
  };

  return (
    <Form
      fields={fields}
      initialData={initialData}
      validationRules={validationRules}
      onSubmit={handleSubmit}
      submitButtonText="Зарегистрироваться"
      title="Регистрация"
      columns={2}
      showAlternateAction={true}
      alternateActionText="Уже есть аккаунт? Войти"
      onAlternateAction={handleLoginClick}
    />
  );
};

export default RegistrationForm;