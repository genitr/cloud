import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { 
  LoginData, 
  RegistrationData,
  LoginResponse,
  RegisterResponse,
  AuthState, 
  UserDetail,
} from '../../types';
import { getCSRFToken } from '../../utils/csrf';

const API_URL = import.meta.env.VITE_API_URL;

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Проверка аутентификации
export const checkAuth = createAsyncThunk<
  UserDetail | null,
  void,
  { rejectValue: string }
>(
  'auth/checkAuth',
  async () => {
    try {
      console.log('🔍 Проверка аутентификации...');
      
      const response = await fetch(`${API_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📡 Ответ от /users/me/:', response.status);

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          console.log('❌ Пользователь не авторизован');
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data: UserDetail = await response.json();
      
      if (!data || !data.username) {
        console.error('❌ Некорректный ответ сервера: нет username');
        return null;
      }
      
      console.log('✅ Пользователь авторизован:', data.username);
      return data;
    } catch (error) {
      console.error('❌ Ошибка проверки аутентификации:', error);
      return null;
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<
  UserDetail,
  void,
  { rejectValue: string }
>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки профиля');
      }

      const data: UserDetail = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке профиля: ' + error);
    }
  }
);

export const register = createAsyncThunk<
  RegisterResponse,
  RegistrationData,
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify({
          username: userData.login,
          email: userData.email,
          password: userData.password,
          password2: userData.confirmPassword,
          first_name: userData.firstName,
          last_name: userData.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Ошибка регистрации');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Ошибка сети при регистрации :' + error);
    }
  }
);

export const login = createAsyncThunk<
  LoginResponse,
  LoginData,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify({
          username: credentials.login,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || data.message || 'Ошибка входа');
      }

      // После успешного входа получаем данные пользователя
      await dispatch(checkAuth());
      
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка сети при входе :' + error);
    }
  }
);

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/logout/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Ошибка при выходе на сервере');
      }
    } catch (error) {
      console.error('Ошибка сети при выходе :' + error);
      return rejectWithValue('Ошибка при выходе');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logoutLocal: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.username) {
          state.user = action.payload;
          state.isAuthenticated = true;
          console.log('✅ Состояние обновлено: пользователь', action.payload.username);
        } else {
          state.user = null;
          state.isAuthenticated = false;
          console.log('❌ Нет данных пользователя, аутентификация сброшена');
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки профиля';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка регистрации';
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка входа';
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { clearError, logoutLocal } = authSlice.actions;
export default authSlice.reducer;