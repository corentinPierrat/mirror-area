import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; 

import Header from './components/Header';
import HeaderDashboard from './components/HeaderDashboard';
import MyWorkflow from "./components/MyWorkflow";
import Footer from './components/Footer';
import ProfileBubble from "./components/ProfileBubble";
import styles from "./styles/Dashboard.module.css";

export default function Dashboard() {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('userToken', tokenFromUrl);
      
      searchParams.delete('token');
      setSearchParams(searchParams, { replace: true });
    }
    
    const tokenFromStorage = localStorage.getItem('userToken');
    
    if (!tokenFromStorage && !tokenFromUrl) {
      console.log("No token found, redirecting to login.");
      navigate('/login', { replace: true });
    }
    
  }, [navigate, searchParams, setSearchParams]);

  const token = localStorage.getItem('userToken');

  if (!token) {
    return (
      <div style={{
        height: "100vh", display: "flex", justifyContent: "center",
        alignItems: "center", background: "#0d0d0d", color: "white"
      }}>
        Checking authentication...
      </div>
    );
  }
  
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

          <div className={styles.profileSection}>
            <ProfileBubble />
          </div>

          <MyWorkflow />
        </main>
      </div>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
}
