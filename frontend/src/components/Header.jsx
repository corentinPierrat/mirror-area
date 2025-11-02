import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Header.module.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (token) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err) {
          console.error("Token invalide ou expiré, déconnexion...", err);
          localStorage.removeItem("userToken");
        }
      };
      fetchUser();
    }
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem("userToken");
    setUser(null);
    navigate("/");
  };
  
  let avatarUrl = '';
  if (user) {
    avatarUrl = user.profile_image_url
      ? `${API_URL}${user.profile_image_url}`
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`; // Fallback
  }

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles['nav-left']}>
          <Link to="/" className={styles.logo}>Triggers.</Link>
          <ul className={styles['nav-links']}>
            <li><a href="https://trigger.ink/about.json#">About</a></li>
            <li><a href="https://trigger.ink/docs#/">Docs</a></li>
          </ul>
        </div>
        <div className={styles['nav-right']}>
          {user ? (
            <>
              <Link to="/dashboard" className={styles.userProfileBtn}>
                <img src={avatarUrl} alt="Avatar" className={styles.userAvatar} />
                {user.username}
              </Link>

              <button onClick={handleDisconnect} className={styles.disconnectBtn}>
                Disconnect
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles['signin-btn']}>Sign in</Link>
              <Link to="/register" className={styles['signup-btn']}>Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
