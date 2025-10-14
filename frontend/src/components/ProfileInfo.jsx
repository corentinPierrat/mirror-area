import React from "react";
import styles from "../styles/ProfileInfo.module.css";

export default function ProfileInfo({ user, onEdit, onDelete }) {
  if (!user) return <p>Chargement des informations...</p>;

  return (
    <div className={styles.profileCard}>
      <h2 className={styles.title}>Mon Profil</h2>

      <div className={styles.infoGroup}>
        <p><strong>Nom d'utilisateur :</strong> {user.username || "—"}</p>
        <p><strong>Email :</strong> {user.email || "—"}</p>
        <p><strong>ID :</strong> {user.id}</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={onEdit}>
          Modifier le mot de passe
        </button>
        <button className={styles.deleteBtn} onClick={onDelete}>
          Supprimer le compte
        </button>
      </div>
    </div>
  );
}
