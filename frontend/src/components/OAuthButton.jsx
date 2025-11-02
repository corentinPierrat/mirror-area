import React, { useState } from "react";
import styles from "../styles/OAuthButton.module.css";

export default function OAuthButton({ logo, apiRoute, onSuccess, connected }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Missing token! Please sign in first.");
      return;
    }

    console.log("Current token:", token);

    setLoading(true);

    const oauthUrl = `${apiRoute}?token=${token}`;
    window.open(oauthUrl, "_blank");

    onSuccess?.({ token });

    setLoading(false);
  };

  return (
    <button
      className={styles.oauthButton}
      onClick={handleClick}
      disabled={loading || connected}
    >
      <img src={logo} alt="logo" className={styles.logo} />
      {loading ? "Connecting..." : connected ? "Connected" : "Authenticate"}
    </button>
  );
}
