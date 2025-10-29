import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import videoBg from "../../public/bg-video.mp4";
import styles from "../styles/VerifyCode.module.css";

const API_URL = import.meta.env.VITE_API_URL;
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
      setMessage("Invalid code");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/auth/verify`, { email, code });
      if (res.status === 200) navigate("/login");
    } catch (error) {
      setMessage("Invalid code or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage("");
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setMessage("Code returned");
    } catch {
      setMessage("Error sending code");
    }
  };

  return (
    <div className={styles.container}>
      <video
              className={styles.videoBackground}
              src={videoBg}
              autoPlay
              loop
              muted
              playsInline
            />
      <h1 className={styles.title}>Verification code</h1>
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
          {loading ? "Verification..." : "Verify"}
        </button>
      </form>
      <button onClick={handleResend} className={styles.link}>
      Resend code
      </button>
    </div>
  );
}
