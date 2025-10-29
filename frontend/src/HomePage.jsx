import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import styles from "./styles/HomePage.module.css";
import videoBg from "../public/bg-video.mp4";
import LiquidText from "./components/LiquidText";

function HomePage() {
  return (
    <>
      <video
        className={styles.videoBackground}
        src={videoBg}
        autoPlay
        loop
        muted
        playsInline
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Header />
          <div className={styles.containerText}>
            <LiquidText />
          </div>
            <div className={styles.footercontainer}>
            <Footer />
            </div>
        </div>
      </main>
    </>
  );
}

export default HomePage;
