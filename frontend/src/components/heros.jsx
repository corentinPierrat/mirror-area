import React from "react";
import Header from './components/Header';
import styles from "../styles/Footer.module.css";

function heros() {
  return (
    <div className={styles['heros-section']}>
        <Header />
        <h1>TRIGGERS</h1>
        <a>STARTED</a>
    </div>
  );
}

export default heros;
