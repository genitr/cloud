import type { LoginData, RegistrationData, AuthResponse } from '../types';

const API_URL = '/api';

class AuthService {
  // Регистрация
  async register(userData: RegistrationData): Promise<AuthResponse> {
    try {

      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.login,
          email: userData.email,
          password: userData.password,
          password2: userData.confirmPassword,
          first_name: userData.firstName,
          last_name: userData.lastName,
        })
      });

      // Логируем ответ
      const data = await response.json();

      if (!response.ok) {
        // Обработка ошибок с бэкенда
        if (data.error) {
          console.error('Validation errors:', data.errors);
          throw new Error(data.error);
        }
        if (data.errors) {
          // Собираем все ошибки в одну строку
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error('Ошибка регистрации');
      }

      // Сохраняем токен
      const token = data.token;
      
      if (token) {
        this.saveToken(token);
      } else {
        console.warn('No token in response:', data);
      }
      
      return {
        success: true,
        user: data.user,
        token: token,
        message: data.message
      };

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Логин
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.login,    // login → username
          password: credentials.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Ошибка входа');
      }

      // Сохраняем токен
      const token = data.token || data.data?.token;
      
      if (token) {
        this.saveToken(token);
      }
      
      return {
        success: true,
        user: data.user,
        token: token,
        message: data.message
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Логаут
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_URL}/users/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  // Работа с токеном
  saveToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  removeToken() {
    localStorage.removeItem('auth_token');
  }

  // Проверка авторизации
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();