import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foldersReducer from './slices/foldersSlice';
import filesReducer from './slices/filesSlice';
import sharingReducer from './slices/sharingSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    folders: foldersReducer,
    files: filesReducer,
    sharing: sharingReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['files/upload/fulfilled', 'files/upload/pending'],
        ignoredPaths: ['files.uploadProgress'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;