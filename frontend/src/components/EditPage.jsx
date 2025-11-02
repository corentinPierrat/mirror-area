import React from "react";
import { useParams } from "react-router-dom";
import Header from './Header';
import HeaderDashboard from './HeaderDashboard';
import Footer from './Footer';
import Crarea from './Cr-area';
import styles from "../styles/CreationPage.module.css";

export default function EditPage() {
  const { id } = useParams();

  return (
    <div className={styles.dashboardContainer}>
      <video
        className={styles.videoBackground}
        src="/bg-video.mp4"
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
          <div className={styles.CrareaContainer}>
            <Crarea workflowId={id} isEditing />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
