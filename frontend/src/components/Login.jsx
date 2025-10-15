import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    console.log('test', API_URL);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      if (response.status === 200 && response.data.access_token) {
        localStorage.setItem("userToken", response.data.access_token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);

      if (error.response?.status === 401) {
        setMessage("Invalid email or password.");
      } else if (error.response?.status === 422) {
        setMessage("The password is too short.");
      } else if (error.response?.status === 403) {
        try {
          await axios.post(`${API_URL}/auth/resend-verification`, { email });
          navigate("/verify-code", { state: { email } });
        } catch {
          setMessage("Error sending verification code.");
        }
      } else {
        setMessage("Network error, please try again.");
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
        <h1 className={styles.title}>Connection</h1>

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
            {loading ? "Connection..." : "Connection"}
          </button>
        </form>

        <p className={styles.linkText}>
        No account? <span onClick={goToRegister} className={styles.link}>Register</span>
        </p>
      </div>
    </div>
  );
}
