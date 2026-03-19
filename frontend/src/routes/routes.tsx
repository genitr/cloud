import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../Layouts/MainLayout/MainLayout';
import HomePage from '../pages/HomePage/HomePage';
import RegistrationPage from '../pages/RegistrationPage/RegistrationPage';
import LoginPage from '../pages/LoginPage/LoginPage'
import MainPage from '../pages/MainPage/MainPage'
import AdminPage from '../pages/AdminPage/AdminPage';
import SharedFilePage from '../pages/SharedFilePage/SharedFilePage';

// Создаем конфигурацию маршрутов
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/registration',
        element: <RegistrationPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/main',
        element: <MainPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
      {
        path: '/share/:token',
        element: <SharedFilePage />,
      },
      {
        // Страница 404 (не найдено)
        path: '*',
        element: <div>404 - Страница не найдена</div>,
      },
    ],
  },
]);