import React from "react";
import styles from "../styles/HeaderDashboard.module.css";

export default function HeaderDashboard() {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles['nav-left']}>
          {/* <a href="#" className={styles.logo}>Triggers.</a> */}
          <div className={styles.ul_elem}>
            <ul className={styles['nav-links']}>
          <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="/dashboard">Dashboard</a></li>
          <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="/Services">Connexion</a></li>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="/CreationPage">Cr-rea</a></li>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="#">Settings</a></li>
            </ul>
            <h2>Account Pages</h2>
            <ul className={styles['nav-links']}>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="#">Profile</a></li>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="#">Feeds</a></li>
              <li><img src="/arrow.PNG" className={styles.navicons} alt="arrow" /><a href="#">Sign-out</a></li>
            </ul>
            <div className={styles['doc-section']}>
              <h2>Needs help?</h2>
              <p>Please check our docs</p>
              <a href="/docs">DOCUMENTATION</a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
