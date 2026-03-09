import S from './HomePage.module.css'
import { Link } from 'react-router-dom';

import Button from '../../components/ui/Button/Button'

const HomePage = () => {

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
        <Link to="/login">
          <Button 
            size="large"
          >
            Войти
          </Button>
        </Link>
        <Link to="/registration">
          <Button
            size="large"
          >
            Зарегистрироваться
          </Button>
        </Link>
        <Link to="/main">
          <Button
            size="large"
          >
            Хранилище
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HomePage;