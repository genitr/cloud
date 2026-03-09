import S from './Header.module.css'
import { Link, useLocation } from 'react-router-dom';
import Icon from '../../components/ui/Icon/Icon'

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { 
        path: '/', 
        label: 'Главная', 
        icon: <Icon name='home' className={S.navLinkIcon} /> 
    },
    { 
        path: '/login', 
        label: 'Войти', 
        icon: <Icon name='home' className={S.navLinkIcon} /> 
    },
    { 
        path: '/registration', 
        label: 'Зарегистрироваться', 
        icon: <Icon name='home' className={S.navLinkIcon} /> 
    },
  ];

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
          </ul>
        </nav>
        
        {/* Подстройка меню под мобильные устройства */}
        <div className={S.mobileMenu}>
          <select
            className={S.mobileSelect}
            value={location.pathname}
            onChange={(e) => window.location.href = e.target.value}
          >
            {navItems.map((item) => (
              <option key={item.path} value={item.path}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;