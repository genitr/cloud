import S from './RegistrationPage.module.css'
import RegistrationForm from '../../components/RegistrationForm/RegistrationForm';

const RegistrationPage = () => {
  return (
    <div className={S.container}>
      <RegistrationForm />
    </div>
  )
};

export default RegistrationPage;