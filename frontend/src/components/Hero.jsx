import React, { useEffect, useState } from "react";
import Header from './Header';
import styles from "../styles/Hero.module.css"; 

export default function Hero() {
  return (
    <section className={styles['hero-section']}>
      <Header />

      <div className={styles['hero-main']}>
  <div className={styles['hero-content']}>
    <h1 className={styles['hero-title']}>
      Create automations
      <br />
      Actions—Reactions
    </h1>
    <p className={styles['hero-subtitle']}>
      Connect different applications together and automate workflows.
    </p>
    <button className={styles['hero-button']}>
      Get Started
    </button>
  </div>

  <div className={styles['hero-arrow']}>
    <img src="/arrow.PNG" alt="arrow" />
  </div>
</div>

    </section>
  );
}
