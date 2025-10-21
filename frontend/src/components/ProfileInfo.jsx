import React from "react";
import styles from "../styles/ProfileInfo.module.css";

export default function ProfileInfo({ user, onEdit, onDelete }) {
  if (!user) return <p>Loading information...</p>;

  return (
    <div className={styles.profileCard}>
      <h2 className={styles.title}>My Profile</h2>

      <div className={styles.infoGroup}>
        <p><strong>User name :</strong> {user.username || "—"}</p>
        <p><strong>Email :</strong> {user.email || "—"}</p>
        <p><strong>ID :</strong> {user.id}</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={onEdit}>
        Change password
        </button>
        <button className={styles.deleteBtn} onClick={onDelete}>
        Delete account
        </button>
      </div>
    </div>
  );
}
