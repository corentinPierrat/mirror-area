import React from "react";
import Header from './components/Header';
import HeaderDashboard from './components/HeaderDashboard';
import Footer from './components/Footer';
import videoBg from "../public/bg-video.mp4";
import Crarea from './components/Cr-area';
import styles from "./styles/CreationPage.module.css";

export default function CreationPage() {
  return (
    <div className={styles.dashboardContainer}>
      <video
        className={styles.videoBackground}
        src={videoBg}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className={styles.dashboardBody}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>

        <main className={styles.mainContent}>
          <Header />
          {/* <h1 className={styles.title}>Créer un Workflow</h1> */}
          <div className={styles.CrareaContainer}>
            <Crarea />
          </div>
        </main>
      </div>
      <Footer />

    </div>
  );
}
