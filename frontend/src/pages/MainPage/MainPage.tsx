// MainPage.tsx (обновленная версия)
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFolders } from '../../store/slices/foldersSlice';
import { fetchFiles } from '../../store/slices/filesSlice';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import S from './MainPage.module.css';

const MainPage = () => {
  const dispatch = useAppDispatch();
  
  const { folders, isLoading: foldersLoading, error: foldersError } = useAppSelector(state => state.folders);
  const { files, isLoading: filesLoading, error: filesError } = useAppSelector(state => state.files);
  const { user, isLoading: authLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
    
    dispatch(fetchFolders());
    dispatch(fetchFiles({}));
  }, [dispatch, user]);

  if (authLoading) {
    return <div className={S.container}>Загрузка профиля...</div>;
  }

  return (
    <div className={S.container}>
      <h1>Файловое хранилище</h1>
      
      {user ? (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
          <div><strong>Пользователь:</strong> {user.username}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Имя:</strong> {user.first_name || 'не указано'} {user.last_name || ''}</div>
        </div>
      ) : (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
          Данные пользователя не загружены
        </div>
      )}
      
      {/* Папки */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Папки ({folders.length})</h2>
        
        {foldersLoading && <div>Загрузка папок...</div>}
        {foldersError && <div style={{ color: 'red' }}>Ошибка: {foldersError}</div>}
        
        {!foldersLoading && !foldersError && folders.length === 0 && (
          <div>Нет доступных папок</div>
        )}
        
        {!foldersLoading && !foldersError && folders.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {folders.map(folder => (
              <li key={folder.id} style={{ 
                padding: '10px', 
                margin: '5px 0', 
                background: '#e6f3ff',
                borderRadius: '4px'
              }}>
                <strong>{folder.name}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Путь: {folder.full_path}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Файлы */}
      <div>
        <h2>Файлы ({files.length})</h2>
        
        {filesLoading && <div>Загрузка файлов...</div>}
        {filesError && <div style={{ color: 'red' }}>Ошибка: {filesError}</div>}
        
        {!filesLoading && !filesError && files.length === 0 && (
          <div>Нет доступных файлов</div>
        )}
        
        {!filesLoading && !filesError && files.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map(file => (
              <li key={file.id} style={{ 
                padding: '10px', 
                margin: '5px 0', 
                background: '#f5f5f5',
                borderRadius: '4px'
              }}>
                <strong>{file.name}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Размер: {file.size_formatted} | 
                  Тип: {file.content_type}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MainPage;