import { Link } from 'react-router-dom';

import S from './HomePage.module.css'
import Button from '../../components/ui/Button/Button'
import { useAppSelector } from '../../store/hooks';

const HomePage = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);

  return (
    <section className={S.hero}>
      <h1 className={S.title}>
        Онлайн-хранилище для ваших файлов
      </h1>
      <p className={S.subtitle}>
        Безопасное облачное хранилище поможет без труда предоставлять доступ 
        к файлам и более эффективно работать вместе с другими пользователями.
      </p>
      <div className={S.actions}>
        {!isAuthenticated ? (
          <>
            <Link to="/login">
              <Button 
                size="large"
                title='Перейти к форме входа'
              >
                Войти
              </Button>
            </Link>
            <Link to="/registration">
              <Button
                size="large"
                title='Перейти к форме регистрации'
              >
                Зарегистрироваться
              </Button>
            </Link>
          </>
        ): (
          <Link to="/main">
            <Button
              size="large"
              title='Перейти к файловому хранилище'
            >
              Мой диск
            </Button>
          </Link>
        )
      }
      </div>
    </section>
  );
};

export default HomePage;