import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';
import Form from '../ui/Form/Form';
import { validateLogin, validatePassword } from '../../utils/validation';
import type { LoginData, FormFieldValue, FormData as FormDataType } from '../../types';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Если пользователь уже авторизован, редиректим на главную
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main');
    }
  }, [isAuthenticated, navigate]);

  // Очищаем ошибку при размонтировании
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const fields = [
    { name: 'login', type: 'text' as const, label: 'Логин', placeholder: 'Введите логин' },
    { name: 'password', type: 'password' as const, label: 'Пароль', placeholder: 'Введите пароль' }
  ];

  const initialData: LoginData = {
    login: '',
    password: ''
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
    }
  };

  const handleSubmit = async (formData: FormDataType) => {
    const loginData: LoginData = {
      login: String(formData.login || ''),
      password: String(formData.password || '')
    };

    const result = await dispatch(login(loginData));
    
    // Успешный вход - редирект произойдет в useEffect
    if (login.fulfilled.match(result)) {
      return { success: true };
    } else {
      throw new Error(error || 'Ошибка при входе');
    }
  };

  const handleRegisterClick = (): void => {
    navigate('/registration');
  };

  return (
    <Form
      fields={fields}
      initialData={initialData}
      validationRules={validationRules}
      onSubmit={handleSubmit}
      submitButtonText={isLoading ? 'Вход...' : 'Войти'}
      title="Вход в систему"
      columns={1}
      showAlternateAction={true}
      alternateActionText="Нет аккаунта? Зарегистрироваться"
      onAlternateAction={handleRegisterClick}
      serverError={error}
    />
  );
};

export default LoginForm;