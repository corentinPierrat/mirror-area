import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import HeaderDashboard from "./components/HeaderDashboard";
import Footer from "./components/Footer";
import ProfileInfo from "./components/ProfileInfo";
import styles from "./styles/Account.module.css";

const API_URL = import.meta.env.VITE_API_URL;
export default function Account() {
  const [user, setUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("userToken");

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Profile recovery error:", err);
      setMessage("Unable to retrieve your information.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${API_URL}/auth/change-password`,
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password updated successfully");
      setShowPasswordForm(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Password change error:", err);
      setMessage("Error changing password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? ?")) return;
    try {
      await axios.delete(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("userToken");
      window.location.href = "/login";
    } catch (err) {
      console.error("Account deletion error:", err);
      setMessage("Error deleting account.");
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className={styles.pageContainer}>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>

        <main className={styles.mainContent}>
        <Header />
          <div className={styles.accountContainer}>
            {message && <p className={styles.message}>{message}</p>}

            <ProfileInfo
              user={user}
              onEdit={() => setShowPasswordForm(true)}
              onDelete={handleDeleteAccount}
            />

            {showPasswordForm && (
              <form className={styles.passwordForm} onSubmit={handleChangePassword}>
                <h3>Change password</h3>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit" className={styles.saveBtn}>
                  Save
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
