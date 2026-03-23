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

  useEffect(() => {
    if (isAuthenticated && !user) {
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

  // Показываем заглушку во время загрузки профиля
  const renderProfileButton = () => {
    if (isLoading) {
      return (
        <div className={S.profileButtonSkeleton}>
          <div className={S.skeletonAvatar} />
          <div className={S.skeletonName} />
        </div>
      );
    }

    if (!user) return null;

    return (
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
        <Icon 
          name="arrowUp" 
          className={`${S.chevron} ${isProfileMenuOpen ? S.rotated : ''}`}
          size={16}
        />
      </button>
    );
  };

  // Навигационные элементы для неавторизованных пользователей
  const publicNavItems = [
    { 
      path: '/login', 
      label: 'Войти', 
      icon: <Icon name='login' className={S.navLinkIcon} /> 
    },
    { 
      path: '/registration', 
      label: 'Зарегистрироваться', 
      icon: <Icon name='register' className={S.navLinkIcon} /> 
    },
  ];

  return (
    <header className={S.header}>
      <div className={S.container}>
        <Link to="/" className={S.logo}>
          <Icon name='logo' className={S.logoIcon} size={36} />
          <span className="text-gradient">Диск</span>
        </Link>

        <nav className={S.nav}>
          <ul className={S.navList}>
            {!isAuthenticated && publicNavItems.map((item) => (
              <li key={item.path} className={S.navItem}>
                <Link
                  to={item.path}
                  className={`${S.navLink} ${
                    location.pathname === item.path ? S.active : ''
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            
            {/* Блок с профилем для авторизованных пользователей */}
            {isAuthenticated && (
              <li className={`${S.navItem} ${S.profileItem}`}>
                <div className={S.profileContainer}>
                  {renderProfileButton()}
                  
                  {isProfileMenuOpen && user && (
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
                          to="/admin" 
                          className={S.dropdownItem}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Icon name='admin' size={18} />
                          <span>Админ панель</span>
                        </Link>
                      )}
                      
                      <Link 
                        to="/main" 
                        className={S.dropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name='user' size={18} />
                        <span>Мой диск</span>
                      </Link>
                      
                      <div className={S.dropdownDivider} />
                      
                      <button 
                        className={S.dropdownItem}
                        onClick={handleLogout}
                      >
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

        {/* Мобильное меню */}
        <div className={S.mobileMenu}>
          {isAuthenticated ? (
            <div className={S.mobileProfile}>
              <button 
                className={S.mobileProfileButton}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className={S.mobileAvatar}>
                  {user?.first_name?.[0] || user?.username[0] || 'U'}
                </div>
              </button>
              
              {isProfileMenuOpen && user && (
                <div className={S.mobileDropdown}>
                  <div className={S.mobileDropdownHeader}>
                    <div className={S.mobileDropdownAvatar}>
                      {user.first_name?.[0] || user.username[0]}
                    </div>
                    <div className={S.mobileDropdownInfo}>
                      <div className={S.mobileDropdownName}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div className={S.mobileDropdownEmail}>{user.email}</div>
                    </div>
                  </div>
                  
                  <div className={S.mobileDropdownDivider} />
                  
                  <select
                    className={S.mobileSelect}
                    value={location.pathname}
                    onChange={(e) => {
                      if (e.target.value === 'logout') {
                        handleLogout();
                      } else {
                        navigate(e.target.value);
                        setIsProfileMenuOpen(false);
                      }
                    }}
                  >
                    <option value="/">Главная</option>
                    <option value="/profile">Профиль</option>
                    {user.is_staff && <option value="/admin">Админ панель</option>}
                    <option value="/main">Мой диск</option>
                    <option value="logout">Выйти</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <select
              className={S.mobileSelect}
              value={location.pathname}
              onChange={(e) => navigate(e.target.value)}
            >
              {publicNavItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;