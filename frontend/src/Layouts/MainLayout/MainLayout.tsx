import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { checkAuth } from '../../store/slices/authSlice';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import S from './MainLayout.module.css';

const Layout = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);

   // Публичные страницы, где не нужна проверка аутентификации
  const publicPaths = ['/', '/login', '/registration'];
  const isPublicPage = publicPaths.includes(location.pathname);

  
  useEffect(() => {
    // Не проверяем аутентификацию на публичных страницах
    if (isPublicPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialized(true);
      return;
    }

    const initAuth = async () => {
      console.log('🚀 Инициализация аутентификации...');
      const result = await dispatch(checkAuth());
      setInitialized(true);
      
      // Проверяем результат
      if (checkAuth.fulfilled.match(result) && result.payload) {
        console.log('✅ Аутентификация успешна');
      } else {
        console.log('❌ Пользователь не аутентифицирован');
      }
    };
    
    initAuth();
  }, [dispatch, isPublicPage]);

  // Редирект на логин только после инициализации
  useEffect(() => {
    if (initialized && !isLoading && !isAuthenticated) {
      const protectedPaths = ['/main', '/admin'];
      if (protectedPaths.includes(window.location.pathname)) {
        console.log('🔄 Редирект на логин');
        navigate('/login');
      }
    }
  }, [initialized, isLoading, isAuthenticated, navigate]);

  if (!initialized || isLoading) {
    return <LoadingSpinner fullScreen text="Загрузка приложения..." />;
  }

  return (
    <div className={S.app}>
      <Header />
      <main className={S.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;