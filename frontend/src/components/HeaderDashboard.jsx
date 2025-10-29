import React from "react";
import styles from "../styles/HeaderDashboard.module.css";

export default function HeaderDashboard() {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles['nav-left']}>
          <div className={styles.ul_elem}>
            <ul className={styles['nav-links']}>
          <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="/dashboard">Dashboard</a></li>
          <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="/Services">Connexion</a></li>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="/CreationPage">Cr-rea</a></li>
            </ul>
            <h2>Account Pages</h2>
            <ul className={styles['nav-links']}>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="/Account">Profile</a></li>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="#">Feeds</a></li>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="#">Abonments</a></li>
            </ul>
            <div className={styles['doc-section']}>
              <h2>Needs help?</h2>
              <p>Please check our docs</p>
              <a href="https://trigger.ink/docs#/">DOCUMENTATION</a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
