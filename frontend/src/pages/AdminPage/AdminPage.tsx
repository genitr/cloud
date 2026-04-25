import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsers, fetchUserStats, toggleUserActive, makeAdmin, removeAdmin, deleteUser } from '../../store/slices/usersSlice';
import S from './AdminPage.module.css';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import ConfirmActionModal from '../../components/Modals/ConfirmActionModal';
import Icon from '../../components/ui/Icon/Icon';

const AdminPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, userStats, isLoading, error } = useAppSelector(state => state.users);
  const { user: currentUser } = useAppSelector(state => state.auth);
  
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
    navigate(`/admin/user/${userId}`);
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
          <div className={S.statCard} title='Всего пользователей'>
            <div className={S.statIcon}>
              <Icon name='allUsers' />
            </div>
            <div className={S.statValue}>{userStats.total_users}</div>
          </div>
          <div className={S.statCard} title='Активных пользователей'>
            <div className={S.statIcon}>
              <Icon name='activeUser' />
            </div>
            <div className={S.statValue}>{userStats.active_users}</div>
          </div>
          <div className={S.statCard} title='Заблокированных пользователей'>
            <div className={S.statIcon}>
              <Icon name='blockedUser' />
            </div>
            <div className={S.statValue}>{userStats.inactive_users}</div>
          </div>
          <div className={S.statCard} title='Администраторов'>
            <div className={S.statIcon}>
              <Icon name='adminUser' />
            </div>
            <div className={S.statValue}>{userStats.staff_users}</div>
          </div>
          <div className={S.statCard} title='Новых за 30 дней'>
            <div className={S.statIcon}>
              <Icon name='accessTime' />
            </div>
            <div className={S.statValue}>{userStats.new_users_last_30_days}</div>
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
              <th title='id' >ID</th>
              <th title='Логин' >Логин</th>
              <th title='Адрес электронной почты' >Почта</th>
              <th title='Полное имя' >Имя</th>
              <th title='Всего файлов' >Файлов</th>
              <th title='Общий размер всех файлов' >Размер</th>
              <th title='Статус - активен / не активен' >Статус</th>
              <th title='Пользователь является администратором' >Админ</th>
              <th title='Дата регистрации' >Зарегистрирован</th>
              <th title='Действия на профилем пользователя' >Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={user.id === currentUser?.id ? S.currentUser : ''}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{`${user.first_name || '-'} ${user.last_name || '-'}`}</td>
                <td>
                  <span className={S.fileCount}>
                    {user.files_count || 0}
                  </span>
                </td>
                <td>
                  <span className={S.fileSize}>
                    {user.total_size_formatted || '0 Б'}
                  </span>
                </td>
                <td>
                  <span className={`${S.status} ${user.is_active ? S.active : S.inactive}`}>
                    {user.is_active ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td>
                  <span className={`${S.status} ${user.is_staff ? S.admin : S.user}`}>
                    {user.is_staff ? 'Да' : 'Нет'}
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
                        <Icon name='crown' />
                      </button>
                    ) : (
                      <button
                        className={S.actionButton}
                        onClick={() => handleMakeAdmin(user.id, user.username)}
                        disabled={user.is_superuser}
                        title="Назначить администратором"
                      >
                        <Icon name='makeAdmin' />
                      </button>
                    )}
                    
                    <button
                      className={S.actionButton}
                      onClick={() => handleViewUserFiles(user.id)}
                      title="Просмотреть файлы"
                    >
                      <Icon name='userFiles' />
                    </button>
                    
                    <button
                      className={S.actionButton}
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.id === currentUser?.id || user.is_superuser}
                      title="Удалить пользователя"
                    >
                      <Icon name='userDelete' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default AdminPage;