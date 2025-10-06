import React, { useState } from "react";
import OAuthButton from "./components/OAuthButton";
import styles from "./styles/Services.module.css";
import Header from './components/Header';
import HeaderDashboard from './components/HeaderDashboard';
import Footer from './components/Footer';

import SpotifyLogo from "../public/Spotify.png";
import FaceitLogo from "../public/faceit.png";
import XLogo from "../public/X.png";
import GoogleLogo from "../public/google.png";
import SteamLogo from "../public/steam.jpeg";
import DiscordLogo from "../public/discord.png";

const API_URL = "http://10.18.207.151:8080";

export default function Services() {
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("userToken") || "");

  const handleOAuthSuccess = (data) => {
    console.log("Réponse OAuth:", data);
    setConnected(true);
    setToken(localStorage.getItem("userToken"));
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardBody}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>
        <div className={styles.mainContent}>
          <Header />
          <h1>Se connecter à un service</h1>
          {/* <p>Token JWT actuel : <code>{token}</code></p> */}
          
          <div className={styles.oauthContainer}>
            <OAuthButton logo={SpotifyLogo} apiRoute={`${API_URL}/oauth/spotify/login`} onSuccess={handleOAuthSuccess} connected={connected} />
            <OAuthButton logo={FaceitLogo} apiRoute={`${API_URL}/oauth/faceit/login`} onSuccess={handleOAuthSuccess} connected={connected} />
            <OAuthButton logo={XLogo} apiRoute={`${API_URL}/oauth/twitter/login`} onSuccess={handleOAuthSuccess} connected={connected} />
            <OAuthButton logo={GoogleLogo} apiRoute={`${API_URL}/oauth/google/login`} onSuccess={handleOAuthSuccess} connected={connected} />
            <OAuthButton logo={SteamLogo} apiRoute={`${API_URL}/oauth/steam/login`} onSuccess={handleOAuthSuccess} connected={connected} />
            <OAuthButton logo={DiscordLogo} apiRoute={`${API_URL}/oauth/discord/login`} onSuccess={handleOAuthSuccess} connected={connected} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
