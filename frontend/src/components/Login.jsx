import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://84518e6399ca.ngrok-free.app";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      if (response.status === 200 && response.data.access_token) {
        localStorage.setItem("userToken", response.data.access_token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);

      if (error.response?.status === 401) {
        setMessage("Email ou mot de passe invalide.");
      } else if (error.response?.status === 422) {
        setMessage("Le mot de passe est trop court.");
      } else if (error.response?.status === 403) {
        try {
          await axios.post(`${API_URL}/auth/resend-verification`, { email });
          navigate("/verify-code", { state: { email } });
        } catch {
          setMessage("Erreur lors de l'envoi du code de vérification.");
        }
      } else {
        setMessage("Erreur réseau, veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Connexion</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {message && <p className={styles.message}>{message}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Connexion..." : "Connexion"}
          </button>
        </form>

        <p className={styles.linkText}>
          Pas de compte ? <span onClick={goToRegister} className={styles.link}>Inscrivez-vous</span>
        </p>
      </div>
    </div>
  );
}
