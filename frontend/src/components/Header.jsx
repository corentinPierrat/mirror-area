import React from "react";
import styles from "../styles/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles['nav-left']}>
          <a href="#" className={styles.logo}>3Triggers.</a>
          <ul className={styles['nav-links']}>
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Docs</a></li>
          </ul>
        </div>
        <div className={styles['nav-right']}>
          <a href="#" className={styles['signin-btn']}>Sign in</a>
          <a href="#" className={styles['signup-btn']}>
            Sign up
          </a>
        </div>
      </nav>
    </header>
  );
}