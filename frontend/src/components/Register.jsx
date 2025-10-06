import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Register.module.css";

const API_URL = "https://84518e6399ca.ngrok-free.app";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !username || !password || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/auth/register`, { email, username, password });
      if (res.status === 200) {
        navigate("/verify-code", { state: { email } });
      }
    } catch (error) {
      if (error.response?.status === 422) setMessage("Le mot de passe doit faire 8 caractères minimum");
      else if (error.response?.status === 400) setMessage("Cet email est déjà utilisé");
      else setMessage("Erreur réseau, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Créer un compte</h1>
      <form onSubmit={handleRegister} className={styles.form}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
        />
        {message && <p className={styles.message}>{message}</p>}
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
      <p>
        Déjà un compte ?{" "}
        <span onClick={() => navigate("/login")} className={styles.link}>
          Se connecter
        </span>
      </p>
    </div>
  );
}
