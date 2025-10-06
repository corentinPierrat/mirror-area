import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/VerifyCode.module.css";

const API_URL = "http://10.18.207.151:8080";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setMessage("Code invalide");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/auth/verify`, { email, code });
      if (res.status === 200) navigate("/login");
    } catch (error) {
      setMessage("Code invalide ou erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage("");
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setMessage("Code renvoyé !");
    } catch {
      setMessage("Erreur lors de l'envoi du code");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Code de vérification</h1>
      <form onSubmit={handleVerify} className={styles.form}>
        <input
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={styles.input}
          maxLength={6}
        />
        {message && <p className={styles.message}>{message}</p>}
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Vérification..." : "Vérifier"}
        </button>
      </form>
      <button onClick={handleResend} className={styles.link}>
        Renvoyer le code
      </button>
    </div>
  );
}
