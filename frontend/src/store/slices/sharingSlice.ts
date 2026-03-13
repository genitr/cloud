import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  FileSharing, 
  PublicFileShare,
  SharingState 
} from '../../types';
import { API_URL } from '../../types';

const initialState: SharingState = {
  shares: [],
  currentShare: null,
  publicShare: null,
  isLoading: false,
  error: null,
  totalCount: 0,
};

const getAuthHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Token ${token}` }),
});

// Получить все расшаривания пользователя
export const fetchShares = createAsyncThunk(
  'sharing/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/shares/`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки расшариваний');
      }

      const data: FileSharing[] = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке расшариваний: ' + error);
    }
  }
);

// Создать расшаривание файла
export const createShare = createAsyncThunk(
  'sharing/create',
  async (fileId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/files/${fileId}/share/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка создания расшаривания');
      }

      const data: FileSharing = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при создании расшаривания: ' + error);
    }
  }
);

// Получить публичный расшаренный файл по токену
export const fetchPublicShare = createAsyncThunk(
  'sharing/fetchPublic',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/public/share/${token}/`);

      if (!response.ok) {
        throw new Error('Ошибка загрузки расшаренного файла');
      }

      const data: PublicFileShare = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке расшаренного файла: ' + error);
    }
  }
);

// Скачать публичный файл
export const downloadPublicFile = createAsyncThunk(
  'sharing/downloadPublic',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/public/share/${token}/download/`);

      if (!response.ok) {
        throw new Error('Ошибка скачивания файла');
      }

      const blob = await response.blob();
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'file';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return token;
    } catch (error) {
      return rejectWithValue('Ошибка при скачивании файла: ' + error);
    }
  }
);

// Отозвать расшаривание
export const revokeShare = createAsyncThunk(
  'sharing/revoke',
  async (shareId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/shares/${shareId}/revoke/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка отзыва расшаривания');
      }

      return shareId;
    } catch (error) {
      return rejectWithValue('Ошибка при отзыве расшаривания: ' + error);
    }
  }
);

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    clearSharingError: (state) => {
      state.error = null;
    },
    clearPublicShare: (state) => {
      state.publicShare = null;
    },
    setCurrentShare: (state, action: PayloadAction<FileSharing | null>) => {
      state.currentShare = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shares
      .addCase(fetchShares.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShares.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shares = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchShares.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create share
      .addCase(createShare.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createShare.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shares.push(action.payload);
        state.currentShare = action.payload;
      })
      .addCase(createShare.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch public share
      .addCase(fetchPublicShare.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicShare.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicShare = action.payload;
      })
      .addCase(fetchPublicShare.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Revoke share
      .addCase(revokeShare.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(revokeShare.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shares = state.shares.filter(s => s.id !== action.payload);
        if (state.currentShare?.id === action.payload) {
          state.currentShare = null;
        }
      })
      .addCase(revokeShare.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSharingError, clearPublicShare, setCurrentShare } = sharingSlice.actions;
export default sharingSlice.reducer;