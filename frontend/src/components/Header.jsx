import { Link } from "react-router-dom";
import styles from "../styles/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles['nav-left']}>
          <Link to="/" className={styles.logo}>Triggers.</Link>
          <ul className={styles['nav-links']}>
            <li><Link to="/dashboard">Features</Link></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Docs</a></li>
          </ul>
        </div>
        <div className={styles['nav-right']}>
          <Link to="/login" className={styles['signin-btn']}>Sign in</Link>
          <Link to="/register" className={styles['signup-btn']}>Sign up</Link>
        </div>
      </nav>
    </header>
  );
}
