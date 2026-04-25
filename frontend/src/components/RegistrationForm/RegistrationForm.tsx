import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';
import Form from '../ui/Form/Form';
import { 
  validateLogin, validatePassword, validateConfirmPassword,
  validateEmail, validateFirstName, validateLastName
} from '../../utils/validation';
import type { 
  RegistrationData, 
  FormFieldValue, 
  FormData as FormDataType 
} from '../../types';

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // Очищаем ошибку при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const fields = isMobile 
  ?[
    { name: 'login', type: 'text' as const, label: 'Логин', placeholder: 'Введите логин' },
    { name: 'confirmPassword', type: 'password' as const, label: 'Подтверждение пароля', placeholder: 'Подтвердите пароль' },
    { name: 'email', type: 'email' as const, label: 'Почта', placeholder: 'Введите почту' },
    { name: 'firstName', type: 'text' as const, label: 'Имя', placeholder: 'Введите имя' },
    { name: 'password', type: 'password' as const, label: 'Пароль', placeholder: 'Введите пароль' },
    { name: 'lastName', type: 'text' as const, label: 'Фамилия', placeholder: 'Введите фамилию' },
  ]
  : [
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

  const handleSubmit = async (formData: FormDataType) => {
    const registrationData: RegistrationData = {
      login: String(formData.login || ''),
      email: String(formData.email || ''),
      password: String(formData.password || ''),
      confirmPassword: String(formData.confirmPassword || ''),
      firstName: formData.firstName ? String(formData.firstName) : '',
      lastName: formData.lastName ? String(formData.lastName) : ''
    };

    const result = await dispatch(register(registrationData));
    
    // Успешная регистрация
    if (register.fulfilled.match(result)) {
      navigate('/login', { 
        state: { message: 'Регистрация успешна! Теперь войдите в систему.' }
      });
      return { success: true };
    } else {
      throw new Error(error || 'Ошибка при регистрации');
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
      submitButtonText={isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      title="Регистрация"
      columns={2}
      showAlternateAction={true}
      alternateActionText="Уже есть аккаунт? Войти"
      onAlternateAction={handleLoginClick}
      serverError={error}
    />
  );
};

export default RegistrationForm;