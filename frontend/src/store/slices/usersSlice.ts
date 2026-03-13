import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  User, 
  UserDetail, 
  UserStats, 
  StorageInfo,
  UsersState,
  RootState
} from '../../types';
import { API_URL } from '../../types';

const initialState: UsersState = {
  users: [],
  currentUser: null,
  userStats: null,
  storageInfo: null,
  permissions: null,
  isLoading: false,
  error: null,
  totalCount: 0,
};

const getAuthHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

// Типы для ответов
interface ToggleActiveResponse {
  userId: number;
  isActive: boolean;
}

// Получить всех пользователей (только для админов)
export const fetchUsers = createAsyncThunk<User[], void, { state: RootState }>(
  'users/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }

      const data: User[] = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке пользователей: ' + error);
    }
  }
);

// Получить информацию о текущем пользователе
export const fetchCurrentUser = createAsyncThunk<UserDetail, void, { state: RootState }>(
  'users/fetchCurrent',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/me/`, {
        headers: getAuthHeaders(token),
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

// Обновить профиль пользователя
export const updateUserProfile = createAsyncThunk<UserDetail, Partial<UserDetail>, { state: RootState }>(
  'users/updateProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/me/`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка обновления профиля');
      }

      const data: UserDetail = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при обновлении профиля: ' + error);
    }
  }
);

// Получить информацию о хранилище
export const fetchStorageInfo = createAsyncThunk<StorageInfo, number, { state: RootState }>(
  'users/fetchStorage',
  async (userId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/${userId}/storage/`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки информации о хранилище');
      }

      const data: StorageInfo = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке информации о хранилище: ' + error);
    }
  }
);

// Получить статистику пользователей (только для админов)
export const fetchUserStats = createAsyncThunk<UserStats, void, { state: RootState }>(
  'users/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/stats/`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики');
      }

      const data: UserStats = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке статистики: ' + error);
    }
  }
);

// Админские действия
export const toggleUserActive = createAsyncThunk<ToggleActiveResponse, number, { state: RootState }>(
  'users/toggleActive',
  async (userId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/${userId}/toggle_active/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка изменения статуса');
      }

      const data = await response.json();
      return { userId, isActive: data.is_active };
    } catch (error) {
      return rejectWithValue('Ошибка при изменении статуса: ' + error);
    }
  }
);

export const makeAdmin = createAsyncThunk<number, number, { state: RootState }>(
  'users/makeAdmin',
  async (userId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/${userId}/make_admin/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка назначения администратора');
      }

      return userId;
    } catch (error) {
      return rejectWithValue('Ошибка при назначении администратора: ' + error);
    }
  }
);

export const removeAdmin = createAsyncThunk<number, number, { state: RootState }>(
  'users/removeAdmin',
  async (userId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/${userId}/remove_admin/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка снятия прав администратора');
      }

      return userId;
    } catch (error) {
      return rejectWithValue('Ошибка при снятии прав администратора: ' + error);
    }
  }
);

export const deleteUser = createAsyncThunk<number, number, { state: RootState }>(
  'users/delete',
  async (userId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/users/${userId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления пользователя');
      }

      return userId;
    } catch (error) {
      return rejectWithValue('Ошибка при удалении пользователя: ' + error);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<UserDetail | null>) => {
      state.currentUser = action.payload;
    },
    clearStorageInfo: (state) => {
      state.storageInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch storage info
      .addCase(fetchStorageInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStorageInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.storageInfo = action.payload;
      })
      .addCase(fetchStorageInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch user stats
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle user active
      .addCase(toggleUserActive.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload;
        const userIndex = state.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            is_active: isActive
          };
        }
      })

      // Make/remove admin
      .addCase(makeAdmin.fulfilled, (state, action) => {
        const userIndex = state.users.findIndex(u => u.id === action.payload);
        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            is_staff: true
          };
        }
      })
      .addCase(removeAdmin.fulfilled, (state, action) => {
        const userIndex = state.users.findIndex(u => u.id === action.payload);
        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            is_staff: false
          };
        }
      })

      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        state.totalCount = state.users.length;
      });
  },
});

export const { clearUsersError, setCurrentUser, clearStorageInfo } = usersSlice.actions;
export default usersSlice.reducer;