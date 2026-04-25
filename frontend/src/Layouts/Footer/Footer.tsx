import S from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={S.footer}>
      <div className={S.footerContainer}>
        <div className={S.copyright}>
          © {new Date().getFullYear()} Все права защищены.
        </div>
        <div className={S.links}>
          <a href="https://github.com/genitr/cloud" className={S.link}>GitHub</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;