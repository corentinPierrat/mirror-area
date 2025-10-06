import React, { useState } from "react";
import styles from "../styles/OAuthButton.module.css";

export default function OAuthButton({ logo, apiRoute, onSuccess, connected }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Token manquant ! Connectez-vous d'abord.");
      return;
    }

    console.log("Token actuel :", token); // Affiche le token pour vérification

    setLoading(true);

    // Ouvre directement la page OAuth en ajoutant le token en query param
    const oauthUrl = `${apiRoute}?token=${token}`;
    window.open(oauthUrl, "_blank");

    // Tu peux appeler onSuccess si nécessaire pour mettre à jour l'état
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
      {loading ? "Connexion..." : connected ? "Connecté" : "S'authentifier"}
    </button>
  );
}
