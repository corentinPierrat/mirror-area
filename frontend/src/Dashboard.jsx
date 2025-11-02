import React from "react";
import Header from './components/Header';
import HeaderDashboard from './components/HeaderDashboard';
import MyWorkflow from "./components/MyWorkflow";
import Footer from './components/Footer';
import videoBg from "../public/bg-video.mp4";
import ProfileBubble from "./components/ProfileBubble";
import styles from "./styles/Dashboard.module.css";

export default function Dashboard() {
  
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

          <div className={styles.profileSection}>
            <ProfileBubble />
          </div>

          <MyWorkflow />
        </main>
      </div>

      <Footer />
    </div>
  );
}
