import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Register.module.css";

const API_URL = import.meta.env.VITE_API_URL;
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
      setMessage("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
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
      if (error.response?.status === 422) setMessage("Password must be at least 8 characters long");
      else if (error.response?.status === 400) setMessage("This email is already in useé");
      else setMessage("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create an account</h1>
      <form onSubmit={handleRegister} className={styles.form}>
        <input
          type="text"
          placeholder="User name"
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
        />
        {message && <p className={styles.message}>{message}</p>}
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Registration..." : "Register"}
        </button>
      </form>
      <p>
      Already an account ?{" "}
        <span onClick={() => navigate("/login")} className={styles.link}>
        Log in
        </span>
      </p>
    </div>
  );
}
