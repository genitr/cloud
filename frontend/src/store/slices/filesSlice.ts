import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  FileItem,
  FileListItem, 
  FileUploadData, 
  FileFilterParams,
  FilesState,
  RootState
} from '../../types';
import { API_URL } from '../../types';

const initialState: FilesState = {
  files: [],
  currentFile: null,
  isLoading: false,
  error: null,
  uploadProgress: null,
  totalCount: 0,
  filters: {
    folder: null,
    type: undefined,
    search: undefined,
  },
};

const getAuthHeaders = (token: string | null, multipart: boolean = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!multipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

export const fetchFiles = createAsyncThunk<
  FileListItem[],
  FileFilterParams,
  { state: RootState; rejectValue: string }
>(
  'files/fetchAll',
  async (filters, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const params = new URLSearchParams();
      if (filters.folder !== undefined && filters.folder !== null) {
        params.append('folder', String(filters.folder));
      }
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);

      const url = `${API_URL}/files/${params.toString() ? `?${params}` : ''}`;

      const response = await fetch(url, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки файлов');
      }

      const data: FileListItem[] = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке файлов: ' + error);
    }
  }
);

// Получить детали файла
export const fetchFileDetails = createAsyncThunk<
  FileItem,
  number,
  { state: RootState; rejectValue: string }
>(
  'files/fetchDetails',
  async (fileId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/files/${fileId}/`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки деталей файла');
      }

      const data: FileItem = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке деталей файла: ' + error);
    }
  }
);

// Загрузить файл
export const uploadFile = createAsyncThunk<
  FileItem,
  FileUploadData,
  { state: RootState; rejectValue: string }
>(
  'files/upload',
  async (fileData, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const formData = new FormData();
      formData.append('file', fileData.file);
      if (fileData.name) formData.append('name', fileData.name);
      if (fileData.folder !== undefined && fileData.folder !== null) {
        formData.append('folder', String(fileData.folder));
      }
      if (fileData.comment) formData.append('comment', fileData.comment);

      const response = await fetch(`${API_URL}/files/`, {
        method: 'POST',
        headers: getAuthHeaders(token, true),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка загрузки файла');
      }

      const data: FileItem = await response.json();
      
      // Обновляем список файлов в текущей папке
      await dispatch(fetchFiles({ folder: fileData.folder || null }));
      
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке файла: ' + error);
    }
  }
);

// Скачать файл
export const downloadFile = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: string }
>(
  'files/download',
  async (fileId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
        headers: getAuthHeaders(token),
      });

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

      return fileId;
    } catch (error) {
      return rejectWithValue('Ошибка при скачивании файла: ' + error);
    }
  }
);

// Обновить информацию о файле
export const updateFile = createAsyncThunk<
  FileItem,
  { id: number; data: Partial<FileItem> },
  { state: RootState; rejectValue: string }
>(
  'files/update',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/files/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка обновления файла');
      }

      const updatedFile: FileItem = await response.json();
      return updatedFile;
    } catch (error) {
      return rejectWithValue('Ошибка при обновлении файла: ' + error);
    }
  }
);

// Удалить файл
export const deleteFile = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: string }
>(
  'files/delete',
  async (fileId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const response = await fetch(`${API_URL}/files/${fileId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления файла');
      }

      return fileId;
    } catch (error) {
      return rejectWithValue('Ошибка при удалении файла: ' + error);
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearFileError: (state) => {
      state.error = null;
    },
    setCurrentFile: (state, action: PayloadAction<FileItem | null>) => {
      state.currentFile = action.payload;
    },
    setFileFilters: (state, action: PayloadAction<Partial<FileFilterParams>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFileFilters: (state) => {
      state.filters = {
        folder: null,
        type: undefined,
        search: undefined,
      };
    },
    setUploadProgress: (state, action: PayloadAction<number | null>) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch files
      .addCase(fetchFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки файлов';
      })

      // Fetch file details
      .addCase(fetchFileDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFileDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFile = action.payload;
      })
      .addCase(fetchFileDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки деталей файла';
      })

      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.isLoading = false;
        state.uploadProgress = null;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки файла';
        state.uploadProgress = null;
      })

      // Update file
      .addCase(updateFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentFile?.id === action.payload.id) {
          state.currentFile = action.payload;
        }
      })
      .addCase(updateFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка обновления файла';
      })

      // Delete file
      .addCase(deleteFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = state.files.filter(f => f.id !== action.payload);
        if (state.currentFile?.id === action.payload) {
          state.currentFile = null;
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка удаления файла';
      });
  },
});

export const { 
  clearFileError, 
  setCurrentFile, 
  setFileFilters, 
  clearFileFilters,
  setUploadProgress 
} = filesSlice.actions;
export default filesSlice.reducer;