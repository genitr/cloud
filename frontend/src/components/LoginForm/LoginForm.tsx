import { useNavigate } from 'react-router-dom';
import Form from '../ui/Form/Form';
import { validateLogin, validatePassword } from '../../utils/validation';
import authService from '../../services/authService';
import type { LoginData, AuthResponse, FormFieldValue, FormData as FormDataType } from '../../types';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

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

  const handleSubmit = async (formData: FormDataType): Promise<AuthResponse | void> => {
    try {

      const loginData: LoginData = {
        login: String(formData.login || ''),
        password: String(formData.password || '')
      };

      const result = await authService.login(loginData);

      navigate('/main');
      return result;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(String(error.message));
      }
      throw new Error('Ошибка при входе');
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
      submitButtonText="Войти"
      title="Вход в систему"
      columns={1}
      showAlternateAction={true}
      alternateActionText="Нет аккаунта? Зарегистрироваться"
      onAlternateAction={handleRegisterClick}
    />
  );
};

export default LoginForm;