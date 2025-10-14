import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import HeaderDashboard from "./components/HeaderDashboard";
import Footer from "./components/Footer";
import ProfileInfo from "./components/ProfileInfo";
import styles from "./styles/Account.module.css";

const API_URL = "http://10.18.207.83:8080";

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
      console.error("Erreur récupération profil:", err);
      setMessage("Impossible de récupérer vos informations.");
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
      setMessage("Mot de passe mis à jour avec succès !");
      setShowPasswordForm(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Erreur changement mot de passe:", err);
      setMessage("Erreur lors du changement de mot de passe.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer votre compte ?")) return;
    try {
      await axios.delete(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("userToken");
      window.location.href = "/login";
    } catch (err) {
      console.error("Erreur suppression compte:", err);
      setMessage("Erreur lors de la suppression du compte.");
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Header />

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.accountContainer}>
            {message && <p className={styles.message}>{message}</p>}

            <ProfileInfo
              user={user}
              onEdit={() => setShowPasswordForm(true)}
              onDelete={handleDeleteAccount}
            />

            {showPasswordForm && (
              <form className={styles.passwordForm} onSubmit={handleChangePassword}>
                <h3>Modifier le mot de passe</h3>
                <input
                  type="password"
                  placeholder="Ancien mot de passe"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit" className={styles.saveBtn}>
                  Enregistrer
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
