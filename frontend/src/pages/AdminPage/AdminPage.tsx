import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsers, fetchUserStats, toggleUserActive, makeAdmin, removeAdmin, deleteUser } from '../../store/slices/usersSlice';
import { fetchFolders } from '../../store/slices/foldersSlice';
import { fetchFiles, deleteFile } from '../../store/slices/filesSlice';
import S from './AdminPage.module.css';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import FilePreviewModal from '../../components/Modals/FilePreviewModal';
import type { FileListItem, Folder } from '../../types';
import { formatDate, formatFileSize } from '../../utils/formatNumber';
import Icon from '../../components/ui/Icon/Icon';

const AdminPage = () => {
  const dispatch = useAppDispatch();
  const { users, userStats, isLoading, error } = useAppSelector(state => state.users);
  const { user: currentUser } = useAppSelector(state => state.auth);
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileListItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileListItem | null>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchUserStats());
  }, [dispatch]);

  const handleToggleActive = async (userId: number, currentStatus: boolean, username: string) => {
    const action = currentStatus ? 'заблокировать' : 'разблокировать';
    setActionModal({
      isOpen: true,
      title: 'Подтверждение действия',
      message: `Вы уверены, что хотите ${action} пользователя ${username}?`,
      onConfirm: async () => {
        try {
          await dispatch(toggleUserActive(userId)).unwrap();
          dispatch(fetchUsers());
        } catch (error) {
          console.error('Ошибка при изменении статуса:', error);
        } finally {
          setActionModal(null);
        }
      }
    });
  };

  const handleMakeAdmin = async (userId: number, username: string) => {
    setActionModal({
      isOpen: true,
      title: 'Подтверждение действия',
      message: `Вы уверены, что хотите назначить пользователя ${username} администратором?`,
      onConfirm: async () => {
        try {
          await dispatch(makeAdmin(userId)).unwrap();
          dispatch(fetchUsers());
        } catch (error) {
          console.error('Ошибка при назначении администратора:', error);
        } finally {
          setActionModal(null);
        }
      }
    });
  };

  const handleRemoveAdmin = async (userId: number, username: string) => {
    setActionModal({
      isOpen: true,
      title: 'Подтверждение действия',
      message: `Вы уверены, что хотите снять права администратора с пользователя ${username}?`,
      onConfirm: async () => {
        try {
          await dispatch(removeAdmin(userId)).unwrap();
          dispatch(fetchUsers());
        } catch (error) {
          console.error('Ошибка при снятии прав администратора:', error);
        } finally {
          setActionModal(null);
        }
      }
    });
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    setUserToDelete({ id: userId, name: username });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await dispatch(deleteUser(userToDelete.id)).unwrap();
      dispatch(fetchUsers());
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleViewUserFiles = (userId: number) => {
    setSelectedUserId(userId);
    dispatch(fetchFolders());
    dispatch(fetchFiles({}));
  };

  const handleFilePreview = (file: FileListItem) => {
    setSelectedFile(file);
    setPreviewModalOpen(true);
  };

  const handleFileDelete = (file: FileListItem) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const confirmFileDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      await dispatch(deleteFile(fileToDelete.id)).unwrap();
      // Обновляем список файлов
      dispatch(fetchFiles({}));
      setFileToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
      alert('Не удалось удалить файл');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return <div className={S.container}>Загрузка...</div>;
  }

  return (
    <div className={S.container}>
      <h1>Панель администратора</h1>
      
      {/* Статистика */}
      {userStats && (
        <div className={S.statsGrid}>
          <div className={S.statCard}>
            <div className={S.statValue}>{userStats.total_users}</div>
            <div className={S.statLabel}>Всего пользователей</div>
          </div>
          <div className={S.statCard}>
            <div className={S.statValue}>{userStats.active_users}</div>
            <div className={S.statLabel}>Активных</div>
          </div>
          <div className={S.statCard}>
            <div className={S.statValue}>{userStats.inactive_users}</div>
            <div className={S.statLabel}>Заблокированных</div>
          </div>
          <div className={S.statCard}>
            <div className={S.statValue}>{userStats.staff_users}</div>
            <div className={S.statLabel}>Администраторов</div>
          </div>
          <div className={S.statCard}>
            <div className={S.statValue}>{userStats.new_users_last_30_days}</div>
            <div className={S.statLabel}>Новых за 30 дней</div>
          </div>
        </div>
      )}

      {/* Таблица пользователей */}
      <div className={S.usersTable}>
        <h2>Управление пользователями</h2>
        
        {error && <div className={S.error}>{error}</div>}
        
        <table className={S.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя пользователя</th>
              <th>Email</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Статус</th>
              <th>Админ</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={user.id === currentUser?.id ? S.currentUser : ''}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.first_name || '-'}</td>
                <td>{user.last_name || '-'}</td>
                <td>
                  <span className={`${S.status} ${user.is_active ? S.active : S.inactive}`}>
                    {user.is_active ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td>
                  <span className={`${S.status} ${user.is_staff ? S.admin : S.user}`}>
                    {user.is_staff ? 'Да' : user.is_superuser ? 'super' : 'Нет'}
                    
                  </span>
                </td>
                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                <td>
                  <div className={S.actions}>
                    <button
                      className={S.actionButton}
                      onClick={() => handleToggleActive(user.id, user.is_active, user.username)}
                      disabled={user.id === currentUser?.id || user.is_superuser}
                      title={user.is_active ? 'Заблокировать' : 'Разблокировать'}
                    >
                      {user.is_active ? <Icon name='lock' /> : <Icon name='unlock' />}
                    </button>
                    
                    {user.is_staff ? (
                      <button
                        className={S.actionButton}
                        onClick={() => handleRemoveAdmin(user.id, user.username)}
                        disabled={user.id === currentUser?.id || user.is_superuser}
                        title="Снять права администратора"
                      >
                        ❌
                      </button>
                    ) : (
                      <button
                        className={S.actionButton}
                        onClick={() => handleMakeAdmin(user.id, user.username)}
                        disabled={user.is_superuser}
                        title="Назначить администратором"
                      >
                        <Icon name='crown' />
                      </button>
                    )}
                    
                    <button
                      className={S.actionButton}
                      onClick={() => handleViewUserFiles(user.id)}
                      title="Просмотреть файлы"
                    >
                      <Icon name='folder' />
                    </button>
                    
                    <button
                      className={S.actionButton}
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.id === currentUser?.id || user.is_superuser}
                      title="Удалить пользователя"
                    >
                      <Icon name='delete' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно с файлами пользователя */}
      {selectedUserId && (
        <UserFilesModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onFilePreview={handleFilePreview}
          onFileDelete={handleFileDelete}
        />
      )}

      {/* Модальное окно превью файла */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
      />

      {/* Модальное окно подтверждения удаления файла */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen && !!fileToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmFileDelete}
        itemName={fileToDelete?.name}
      />

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen && !!userToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemName={userToDelete?.name}
      />

      {/* Модальное окно для других действий */}
      {actionModal && (
        <ConfirmActionModal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal(null)}
          onConfirm={actionModal.onConfirm}
          title={actionModal.title}
          message={actionModal.message}
        />
      )}
    </div>
  );
};

// Модальное окно для подтверждения действий
const ConfirmActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className={S.modalOverlay} onClick={onClose}>
      <div className={S.modal} onClick={e => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <h3>{title}</h3>
          <button className={S.closeButton} onClick={onClose}>✕</button>
        </div>
        <div className={S.modalContent}>
          <p>{message}</p>
        </div>
        <div className={S.modalFooter}>
          <button className={S.cancelButton} onClick={onClose}>Отмена</button>
          <button className={S.confirmButton} onClick={onConfirm}>Подтвердить</button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно для просмотра файлов пользователя
const UserFilesModal = ({ 
  userId, 
  onClose, 
  onFilePreview, 
  onFileDelete 
}: { 
  userId: number; 
  onClose: () => void;
  onFilePreview: (file: FileListItem) => void;
  onFileDelete: (file: FileListItem) => void;
}) => {
  const { folders } = useAppSelector(state => state.folders);
  const { files } = useAppSelector(state => state.files);
  const { users } = useAppSelector(state => state.users);
  const [selectedType, setSelectedType] = useState<'all' | 'files' | 'folders'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  
  const user = users.find(u => u.id === userId);
  
  // Фильтруем папки по владельцу
  const userFolders = folders.filter((folder: Folder) => folder.owner === userId);
  
  // Фильтруем файлы по владельцу
  const userFiles = files.filter((file: FileListItem) => {
    return (file as FileListItem).owner === userId || (file as FileListItem).owner_info?.id === userId;
  });

  // Фильтрация по поиску
  const filteredFolders = userFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredFiles = userFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (contentType: string) => {
    if (!contentType) return <Icon name='file' />;
    if (contentType.startsWith('image/')) return <Icon name='imageFile' />;
    if (contentType.startsWith('video/')) return <Icon name='videoFile' />;
    if (contentType.startsWith('audio/')) return <Icon name='audioFile' />;
    if (contentType.includes('pdf')) return <Icon name='pdfFile' />;
    if (contentType.includes('text') || contentType.includes('msword')) return <Icon name='textFile' />;
    if (contentType.includes('zip') || contentType.includes('rar')) return <Icon name='zipFile' />;
    return <Icon name='file' />;
  };

  const totalSize = userFiles.reduce((sum, file) => {
    const sizeMatch = file.size_formatted.match(/^([\d.]+)\s*([БКМГТ]?)/);
    if (sizeMatch) {
      const value = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2];
      const multipliers: Record<string, number> = {
        'Б': 1,
        'К': 1024,
        'М': 1024 * 1024,
        'Г': 1024 * 1024 * 1024,
      };
      return sum + (value * (multipliers[unit] || 1));
    }
    return sum;
  }, 0);

  return (
    <div className={S.modalOverlay} onClick={onClose}>
      <div className={`${S.modal} ${S.userFilesModal}`} onClick={e => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <h3>Файлы пользователя {user?.username}</h3>
          <button className={S.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={S.modalContent}>
          {/* Статистика */}
          <div className={S.statsSection}>
            <div className={S.statCard}>
              <span className={S.statIcon}><Icon name='folder' size={40} /></span>
              <div>
                <div className={S.statValue}>{userFolders.length}</div>
                <div className={S.statLabel}>Папок</div>
              </div>
            </div>
            <div className={S.statCard}>
              <span className={S.statIcon}><Icon name='file' size={40} /></span>
              <div>
                <div className={S.statValue}>{userFiles.length}</div>
                <div className={S.statLabel}>Файлов</div>
              </div>
            </div>
            <div className={S.statCard}>
              <span className={S.statIcon}><Icon name='database' size={40} /></span>
              <div>
                <div className={S.statValue}>{formatFileSize(totalSize)}</div>
                <div className={S.statLabel}>Общий размер</div>
              </div>
            </div>
          </div>

          {/* Поиск и фильтры */}
          <div className={S.filtersSection}>
            <input
              type="text"
              className={S.searchInput}
              placeholder="Поиск по имени..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={S.typeFilters}>
              <button
                className={`${S.filterButton} ${selectedType === 'all' ? S.active : ''}`}
                onClick={() => setSelectedType('all')}
              >
                Все ({userFolders.length + userFiles.length})
              </button>
              <button
                className={`${S.filterButton} ${selectedType === 'folders' ? S.active : ''}`}
                onClick={() => setSelectedType('folders')}
              >
                Папки ({userFolders.length})
              </button>
              <button
                className={`${S.filterButton} ${selectedType === 'files' ? S.active : ''}`}
                onClick={() => setSelectedType('files')}
              >
                Файлы ({userFiles.length})
              </button>
            </div>
          </div>

          {/* Список файлов и папок */}
          <div className={S.itemsList}>
            {(selectedType === 'all' || selectedType === 'folders') && filteredFolders.map(folder => (
              <div key={folder.id} className={S.itemCard}>
                <div className={S.itemIcon}><Icon name='folder' size={40} /></div>
                <div className={S.itemInfo}>
                  <div className={S.itemName}>{folder.name}</div>
                  <div className={S.itemPath}>{folder.full_path}</div>
                  <div className={S.itemMeta}>
                    {folder.subfolders_count} подпапок • {folder.files_count} файлов
                  </div>
                </div>
              </div>
            ))}

            {(selectedType === 'all' || selectedType === 'files') && filteredFiles.map(file => (
              <div key={file.id} className={S.itemCard}>
                <div className={S.itemIcon}>{getFileIcon(file.content_type)}</div>
                <div className={S.itemInfo}>
                  <div className={S.itemName}>{file.name}</div>
                  <div className={S.itemMeta}>
                    {file.size_formatted} • {formatDate(file.uploaded_at, true)}
                  </div>
                  {file.comment && (
                    <div className={S.itemComment}><Icon name='comment' size={40} /> {file.comment}</div>
                  )}
                </div>
                <div className={S.itemActions}>
                  <button
                    className={S.actionButton}
                    onClick={() => onFilePreview(file)}
                    title="Просмотр"
                  >
                    <Icon name='eye' />
                  </button>
                  <button
                    className={S.actionButton}
                    onClick={() => onFileDelete(file)}
                    title="Удалить"
                  >
                    <Icon name='delete' />
                  </button>
                </div>
              </div>
            ))}

            {filteredFolders.length === 0 && filteredFiles.length === 0 && (
              <div className={S.emptyState}>
                <span className={S.emptyIcon}><Icon name='folder' size={40} /></span>
                <p>Ничего не найдено</p>
              </div>
            )}
          </div>
        </div>
        
        <div className={S.modalFooter}>
          <button className={S.closeButton} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;