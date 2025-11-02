import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ProfileBubble.module.css";

const API_URL = import.meta.env.VITE_API_URL;
export default function ProfileBubble() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Unable to load profile.");
      }
    };
    fetchUser();
  }, [token]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const avatarUrl = user.profile_image_url
    ? `${API_URL}${user.profile_image_url}`
    : `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`;

  return (
    <div
      className={styles.bubble}
      style={{
        backgroundImage: `linear-gradient(
          rgba(120, 0, 255, 0.5),
          rgba(60, 0, 150, 0.6)
        ), url('${avatarUrl}')`,
      }}
    >
      <div className={styles.overlay}>
        <div className={styles.info}>
          <h2>Welcome back !</h2>
          <h2 className={styles.username}>{user.username}</h2>
          <h3>{user.email}</h3>
          <p>Start with new area !</p>
        </div>
      </div>
    </div>
  );
}
