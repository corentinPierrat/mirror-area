import React from "react";
import Header from './components/Header';
import HeaderDashboard from './components/HeaderDashboard';
import Footer from './components/Footer';
import Crarea from './components/Cr-area';
import styles from "./styles/Dashboard.module.css";

export default function CreationPage() {
  return (
    <div className={styles.dashboardContainer}>

      <div className={styles.dashboardBody}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>

        <main className={styles.mainContent}>
          <Header />
          {/* <h1 className={styles.title}>Créer un Workflow</h1> */}
          <Crarea />
        </main>
      </div>

      <Footer />
    </div>
  );
}
