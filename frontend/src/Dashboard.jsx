import React from "react";
import Header from './components/Header';
import HeaderDashboard from './components/HeaderDashboard';
import AreaList from "./components/AreaList";
import Footer from './components/Footer';
import styles from "./styles/Dashboard.module.css";

export default function Dashboard() {
  return (
    <div className={styles.dashboardContainer}>

      <div className={styles.dashboardBody}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>

        <main className={styles.mainContent}>
      <Header />
          <h1 className={styles.title}>Dashboard</h1>
          <AreaList />
        </main>
      </div>

      <Footer />
    </div>
  );
}
