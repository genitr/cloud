import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LoginData, RegistrationData, User } from '../../types';

const API_URL = 'http://localhost:8000/api';

// Типы для состояния
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegistrationData, { rejectWithValue }) => {
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          return rejectWithValue(data.error);
        }
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          return rejectWithValue(errorMessages.join(', '));
        }
        return rejectWithValue('Ошибка регистрации');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Ошибка сети при регистрации: ' + error);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.login,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || data.message || 'Ошибка входа');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Ошибка сети при входе: ' + error);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;

      if (token) {
        const response = await fetch(`${API_URL}/users/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (!response.ok) {
          return rejectWithValue('Ошибка при выходе из системы');
        }
      }
    } catch (error) {
      return rejectWithValue('Ошибка сети при выходе из системы: ' + error);
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
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('auth_token', action.payload);
    },
    logoutLocal: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || action.payload.data?.token;
        state.isAuthenticated = true;
        if (state.token) {
          localStorage.setItem('auth_token', state.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        localStorage.removeItem('auth_token');
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth_token');
      });
  },
});

export const { clearError, setToken, logoutLocal } = authSlice.actions;
export default authSlice.reducer;