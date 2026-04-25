import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  Folder, 
  FolderCreate, 
  FolderTree,
  FolderContents,
  FoldersState,
  RootState,
} from '../../types';
import { getCSRFToken } from '../../utils/csrf';

const API_URL = import.meta.env.VITE_API_URL;

export const selectFolderFileCount = (state: RootState, folderId: number) => {
  const { folders } = state.folders;
  const { files } = state.files;
  
  const calculateCount = (fId: number): number => {
    const subFolders = folders.filter(f => f.parent_folder === fId);
    const currentFolder = folders.find(f => f.id === fId);
    const folderFiles = files.filter(f => 
      currentFolder && f.folder_name === currentFolder.name
    );

    let count = folderFiles.length;

    subFolders.forEach(subFolder => {
      count += calculateCount(subFolder.id);
    });

    return count;
  };

  return calculateCount(folderId);
};

export const selectFolderStats = (state: RootState, folderId: number) => {
  const fileCount = selectFolderFileCount(state, folderId);
  
  return fileCount;
};

const initialState: FoldersState = {
  folders: [],
  currentFolder: null,
  folderTree: [],
  folderContents: null,
  isLoading: false,
  error: null,
  totalCount: 0,
};

const getRequestHeaders = (multipart: boolean = false): HeadersInit => {
    const headers: HeadersInit = {};
    if (!multipart) {
        headers['Content-Type'] = 'application/json';
    }
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }
    return headers;
};

// Получить все папки
export const fetchFolders = createAsyncThunk<
  Folder[],
  { userId?: number } | void,
  { state: RootState; rejectValue: string }
>(
  'folders/fetchAll',
  async (params, { rejectWithValue }) => {
    try {

      let url = `${API_URL}/folders/`;

      if (params && params.userId) {
        url += `?user_id=${params.userId}`;
        console.log('Запрос папок для user_id:', params.userId);
      }

      const response = await fetch(url, {
        headers: getRequestHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки папок');
      }

      const data: Folder[] = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке папок: ' + error);
    }
  }
);

// Получить дерево папок
export const fetchFolderTree = createAsyncThunk<
  FolderTree[],
  void,
  { state: RootState; rejectValue: string }
>(
  'folders/fetchTree',
  async (_, { rejectWithValue }) => {
    try {

      const response = await fetch(`${API_URL}/folders/tree/`, {
        headers: getRequestHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки дерева папок');
      }

      const data: FolderTree[] = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке дерева папок: ' + error);
    }
  }
);

// Получить содержимое папки
export const fetchFolderContents = createAsyncThunk<
  FolderContents,
  number,
  { state: RootState; rejectValue: string }
>(
  'folders/fetchContents',
  async (folderId, { rejectWithValue }) => {
    try {

      const response = await fetch(`${API_URL}/folders/${folderId}/contents/`, {
        headers: getRequestHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки содержимого папки');
      }

      const data: FolderContents = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке содержимого папки: ' + error);
    }
  }
);

// Создать папку
export const createFolder = createAsyncThunk<
  Folder,
  FolderCreate,
  { state: RootState; rejectValue: string }
>(
  'folders/create',
  async (folderData, { rejectWithValue }) => {
    try {

      const response = await fetch(`${API_URL}/folders/`, {
        method: 'POST',
        headers: getRequestHeaders(),
        credentials: 'include',
        body: JSON.stringify(folderData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка создания папки');
      }

      const data: Folder = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Ошибка при создании папки: ' + error);
    }
  }
);

// Обновить папку
export const updateFolder = createAsyncThunk<
  Folder,
  { id: number; data: Partial<FolderCreate>; userId?: number },
  { state: RootState; rejectValue: string }
>(
  'folders/update',
  async ({ id, data, userId }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const isAdmin = state.auth.user?.is_staff || state.auth.user?.is_superuser;
      
      let url = `${API_URL}/folders/${id}/`;
      if (isAdmin && userId) {
        url += `?user_id=${userId}`;
      }
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getRequestHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Ошибка обновления папки');
      }

      const updatedFolder: Folder = await response.json();
      return updatedFolder;
    } catch (error) {
      return rejectWithValue('Ошибка при обновлении папки: ' + error);
    }
  }
);

// Удалить папку
export const deleteFolder = createAsyncThunk<
  number,
  number | { folderId: number; userId?: number },
  { state: RootState; rejectValue: string }
>(
  'folders/delete',
  async (params, { getState, rejectWithValue }) => {
    try {
      // Нормализуем параметры
      let folderId: number;
      let userId: number | undefined;
      
      if (typeof params === 'number') {
        folderId = params;
        userId = undefined;
      } else {
        folderId = params.folderId;
        userId = params.userId;
      }
      
      const state = getState();
      const isAdmin = state.auth.user?.is_staff || state.auth.user?.is_superuser;
      
      let url = `${API_URL}/folders/${folderId}/`;
      if (isAdmin && userId) {
        url += `?user_id=${userId}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getRequestHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления папки');
      }

      return folderId;
    } catch (error) {
      return rejectWithValue('Ошибка при удалении папки: ' + error);
    }
  }
);

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    clearFolderError: (state) => {
      state.error = null;
    },
    setCurrentFolder: (state, action: PayloadAction<Folder | null>) => {
      state.currentFolder = action.payload;
    },
    clearFolderContents: (state) => {
      state.folderContents = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch folders
      .addCase(fetchFolders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки папок';
      })

      // Fetch folder tree
      .addCase(fetchFolderTree.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFolderTree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folderTree = action.payload;
      })
      .addCase(fetchFolderTree.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки дерева папок';
      })

      // Fetch folder contents
      .addCase(fetchFolderContents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFolderContents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folderContents = action.payload;
        const folderData: Folder = {
          id: action.payload.folder.id,
          name: action.payload.folder.name,
          full_path: action.payload.folder.full_path,
          parent_folder: null,
          parent_info: null,
          owner: 0,
          owner_info: null,
          subfolders_count: action.payload.subfolders.length,
          files_count: action.payload.files.length,
          created_at: '',
          updated_at: ''
        };
        state.currentFolder = folderData;
      })
      .addCase(fetchFolderContents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки содержимого папки';
      })

      // Create folder
      .addCase(createFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders.push(action.payload);
        if (state.folderContents) {
          state.folderContents.subfolders.push(action.payload);
        }
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка создания папки';
      })

      // Update folder
      .addCase(updateFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.folders.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.folders[index] = action.payload;
        }
        if (state.currentFolder?.id === action.payload.id) {
          state.currentFolder = action.payload;
        }
        if (state.folderContents) {
          const subfolderIndex = state.folderContents.subfolders.findIndex(f => f.id === action.payload.id);
          if (subfolderIndex !== -1) {
            state.folderContents.subfolders[subfolderIndex] = action.payload;
          }
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка обновления папки';
      })

      // Delete folder
      .addCase(deleteFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders = state.folders.filter(f => f.id !== action.payload);
        if (state.folderContents) {
          state.folderContents.subfolders = state.folderContents.subfolders.filter(
            f => f.id !== action.payload
          );
        }
        if (state.currentFolder?.id === action.payload) {
          state.currentFolder = null;
        }
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка удаления папки';
      });
  },
});

export const { clearFolderError, setCurrentFolder, clearFolderContents } = foldersSlice.actions;
export default foldersSlice.reducer;