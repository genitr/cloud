import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsers, fetchUserStats, toggleUserActive, makeAdmin, removeAdmin, deleteUser } from '../../store/slices/usersSlice';
import { fetchFolders } from '../../store/slices/foldersSlice';
import { fetchFiles } from '../../store/slices/filesSlice';
import S from './AdminPage.module.css';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import type { FileListItem, Folder } from '../../types';

const AdminPage = () => {
  const dispatch = useAppDispatch();
  const { users, userStats, isLoading, error } = useAppSelector(state => state.users);
  const { user: currentUser } = useAppSelector(state => state.auth);
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
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
    // Загружаем данные для выбранного пользователя
    dispatch(fetchFolders());
    dispatch(fetchFiles({}));
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
                      {user.is_active ? '🔒' : '🔓'}
                    </button>
                    
                    {user.is_staff ? (
                      <button
                        className={S.actionButton}
                        onClick={() => handleRemoveAdmin(user.id, user.username)}
                        disabled={user.id === currentUser?.id || user.is_superuser}
                        title="Снять права администратора"
                      >
                        👑❌
                      </button>
                    ) : (
                      <button
                        className={S.actionButton}
                        onClick={() => handleMakeAdmin(user.id, user.username)}
                        disabled={user.is_superuser}
                        title="Назначить администратором"
                      >
                        👑
                      </button>
                    )}
                    
                    <button
                      className={S.actionButton}
                      onClick={() => handleViewUserFiles(user.id)}
                      title="Просмотреть файлы"
                    >
                      📁
                    </button>
                    
                    <button
                      className={`${S.actionButton} ${S.deleteButton}`}
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.id === currentUser?.id || user.is_superuser}
                      title="Удалить пользователя"
                    >
                      🗑️
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
        />
      )}

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
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
const UserFilesModal = ({ userId, onClose }: { userId: number; onClose: () => void }) => {
  const { folders } = useAppSelector(state => state.folders);
  const { files } = useAppSelector(state => state.files);
  const { users } = useAppSelector(state => state.users);
  
  const user = users.find(u => u.id === userId);
  
  // Фильтруем папки по владельцу
  const userFolders = folders.filter((folder: Folder) => folder.owner === userId);
  
  // Фильтруем файлы по владельцу
  const userFiles = files.filter((file: FileListItem) => {
    return (file as FileListItem).owner === userId || 
           (file as FileListItem).owner_info?.id === userId ||
           (file as FileListItem & { owner?: number }).owner === userId;
  });

  return (
    <div className={S.modalOverlay} onClick={onClose}>
      <div className={S.modal} onClick={e => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <h3>Файлы пользователя {user?.username}</h3>
          <button className={S.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={S.modalContent}>
          <div className={S.userStats}>
            <div className={S.statItem}>
              <span className={S.statLabel}>Папки:</span>
              <span className={S.statValue}>{userFolders.length}</span>
            </div>
            <div className={S.statItem}>
              <span className={S.statLabel}>Файлы:</span>
              <span className={S.statValue}>{userFiles.length}</span>
            </div>
          </div>
          
          <h4>Папки</h4>
          <div className={S.fileList}>
            {userFolders.length === 0 ? (
              <p className={S.emptyMessage}>Нет папок</p>
            ) : (
              userFolders.map(folder => (
                <div key={folder.id} className={S.fileItem}>
                  <span className={S.fileIcon}>📁</span>
                  <span className={S.fileName}>{folder.name}</span>
                  <span className={S.filePath}>{folder.full_path}</span>
                </div>
              ))
            )}
          </div>
          
          <h4>Файлы</h4>
          <div className={S.fileList}>
            {userFiles.length === 0 ? (
              <p className={S.emptyMessage}>Нет файлов</p>
            ) : (
              userFiles.map(file => (
                <div key={file.id} className={S.fileItem}>
                  <span className={S.fileIcon}>📄</span>
                  <span className={S.fileName}>{file.name}</span>
                  <span className={S.fileSize}>{file.size_formatted}</span>
                  <span className={S.fileType}>{file.content_type}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className={S.modalFooter}>
          <button className={S.closeButton} onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;