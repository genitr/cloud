import S from './MainLayout.module.css'
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = () => {

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