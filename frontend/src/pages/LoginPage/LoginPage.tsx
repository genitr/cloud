import S from './LoginPage.module.css'
import LoginForm from '../../components/LoginForm/LoginForm';

const RegistrationPage = () => {
  return (
    <div className={S.container}>
      <LoginForm />
    </div>
  )
};

export default RegistrationPage;