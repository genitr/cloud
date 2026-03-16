import S from './Header.module.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon/Icon';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

  // Навигационные элементы для неавторизованных пользователей
  const publicNavItems = [
    { 
      path: '/', 
      label: 'Главная', 
      icon: <Icon name='home' className={S.navLinkIcon} /> 
    },
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

  // Навигационные элементы для авторизованных пользователей
  const privateNavItems = [
    { 
      path: '/', 
      label: 'Главная', 
      icon: <Icon name='home' className={S.navLinkIcon} /> 
    },
    { 
      path: '/profile', 
      label: 'Профиль', 
      icon: <Icon name='profile' className={S.navLinkIcon} /> 
    },
  ];

  const navItems = isAuthenticated ? privateNavItems : publicNavItems;

  return (
    <header className={S.header}>
      <div className={S.container}>
        <Link to="/" className={S.logo}>
          <Icon name='home' className={S.logoIcon} size={36} />
          <span className="text-gradient">Диск</span>
        </Link>

        <nav className={S.nav}>
          <ul className={S.navList}>
            {navItems.map((item) => (
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
                    <Icon 
                      name='chevron-down' 
                      className={`${S.chevron} ${isProfileMenuOpen ? S.rotated : ''}`}
                      size={16}
                    />
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
                      
                      <Link 
                        to="/profile" 
                        className={S.dropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name='profile' size={18} />
                        <span>Мой профиль</span>
                      </Link>
                      
                      <Link 
                        to="/settings" 
                        className={S.dropdownItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Icon name='settings' size={18} />
                        <span>Настройки</span>
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
                  {user?.first_name?.[0] || user?.username[0]}
                </div>
              </button>
              
              {isProfileMenuOpen && (
                <div className={S.mobileDropdown}>
                  <div className={S.mobileDropdownHeader}>
                    <div className={S.mobileDropdownAvatar}>
                      {user?.first_name?.[0] || user?.username[0]}
                    </div>
                    <div className={S.mobileDropdownInfo}>
                      <div className={S.mobileDropdownName}>
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div className={S.mobileDropdownEmail}>{user?.email}</div>
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
                        window.location.href = e.target.value;
                        setIsProfileMenuOpen(false);
                      }
                    }}
                  >
                    {privateNavItems.map((item) => (
                      <option key={item.path} value={item.path}>
                        {item.label}
                      </option>
                    ))}
                    <option value="/settings">Настройки</option>
                    <option value="logout">Выйти</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <select
              className={S.mobileSelect}
              value={location.pathname}
              onChange={(e) => window.location.href = e.target.value}
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