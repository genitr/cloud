import { useEffect, useState } from 'react';
import S from './Header.module.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon/Icon';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, fetchCurrentUser } from '../../store/slices/authSlice';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Загружаем пользователя только если есть сессия
  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log('📥 Загрузка данных пользователя...');
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      navigate('/login');
    } finally {
      setIsProfileMenuOpen(false);
    }
  };

  // Показываем заглушку во время загрузки
  if (isLoading) {
    return (
      <header className={S.header}>
        <div className={S.container}>
          <Link to="/" className={S.logo}>
            <Icon name='logo' className={S.logoIcon} size={36} />
            <span>Диск</span>
          </Link>
          <div className={S.skeleton}>Загрузка...</div>
        </div>
      </header>
    );
  }

  // Навигационные элементы для неавторизованных пользователей
  const publicNavItems = [
    { 
      path: '/login', 
      label: 'Войти', 
      icon: <Icon name='login' className={S.navLinkIcon} />, 
      title: 'Перейти к форме входа' 
    },
    { 
      path: '/registration', 
      label: 'Зарегистрироваться', 
      icon: <Icon name='register' className={S.navLinkIcon} />,
      title: 'Перейти к форме регистрации' 
    },
  ];

  return (
    <header className={S.header}>
      <div className={S.container}>
        <Link to="/" className={S.logo} title='Перейти к домашней странице'>
          <Icon name='logo' className={S.logoIcon} size={36} />
          <span className="text-gradient">Диск</span>
        </Link>

        <nav className={S.nav}>
          <ul className={S.navList}>
            {!isAuthenticated && publicNavItems.map((item) => (
              <li key={item.path} className={S.navItem}>
                <Link
                  to={item.path}
                  className={`${S.navLink} ${location.pathname === item.path ? S.active : ''}`}
                  title={item.title}
                >
                  {item.icon}
                  <span className={S.navItemLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
            
            {/* Блок с профилем для авторизованных пользователей */}
            {isAuthenticated && user && (
              <li className={`${S.navItem} ${S.profileItem}`}>
                <div className={S.profileContainer}>
                  <button 
                    className={S.profileButton}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <div className={S.profileAvatar}>
                      {user.first_name?.[0] || user.username[0]}
                    </div>
                    <span className={S.profileName}>
                      {user.first_name || user.username}
                    </span>
                    <Icon name="arrowUp" className={`${S.chevron} ${isProfileMenuOpen ? S.rotated : ''}`} size={16} />
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className={S.profileDropdown}>
                      <div className={S.dropdownHeader}>
                        <div className={S.dropdownAvatar}>
                          {user.first_name?.[0] || user.username[0]}
                        </div>
                        <div className={S.dropdownInfo}>
                          <div className={S.dropdownName}>
                            {user.first_name} {user.last_name}
                          </div>
                          <div className={S.dropdownEmail}>{user.email}</div>
                        </div>
                      </div>
                      
                      <div className={S.dropdownDivider} />
                      
                      {user.is_staff && (
                        <Link 
                          to="/admin" className={S.dropdownItem} 
                          title='Панель управления пользователями' 
                          onClick={() => setIsProfileMenuOpen(false)}>
                          <Icon name='admin' size={18} />
                          <span>Админ панель</span>
                        </Link>
                      )}
                      
                      <Link 
                        to="/main"
                        title='Файловое хранилище' 
                        className={S.dropdownItem} 
                        onClick={() => setIsProfileMenuOpen(false)}>
                        <Icon name='user' size={18} />
                        <span>Мой диск</span>
                      </Link>
                      
                      <div className={S.dropdownDivider} />
                      
                      <button 
                        className={S.dropdownItem} 
                        title='Выйти из профиля пользователя' 
                        onClick={handleLogout}>
                        <Icon name='logout' size={18} />
                        <span>Выйти</span>
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;