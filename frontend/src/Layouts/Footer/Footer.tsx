import S from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={S.footer}>
      <div className={S.footerContainer}>
        <div className={S.copyright}>
          © {new Date().getFullYear()} Все права защищены.
        </div>
        <div className={S.links}>
          <a href="#" className={S.link}>GitHub</a>
          <a href="#" className={S.link}>Документация</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;