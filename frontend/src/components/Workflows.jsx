import React from "react";
import styles from "../styles/Workflows.module.css";
import axios from "axios";

const API_URL = "http://10.18.207.83:8080";

export default function Workflows({ Name, Action, Reactions = [], workflowId, onDelete, onEdit }) {
  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce workflow ?")) return;
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Utilisateur non authentifié");

      await axios.delete(`${API_URL}/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Workflow supprimé !");
      if (onDelete) onDelete(workflowId);
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer le workflow");
    }
  };

  return (
    <div className={styles.workflowCard}>
      <h2 className={styles.workflowName}>{Name}</h2>
      <p><strong>Action :</strong> {Action}</p>
      <p>
        <strong>Réactions :</strong>{" "}
        {Reactions.length > 0
          ? Reactions.map((r, i) => (
              <span key={i}>
                {r.service} - {r.event}{i < Reactions.length - 1 ? ", " : ""}
              </span>
            ))
          : "Aucune réaction"}
      </p>
      <div className={styles.buttonContainer}>
        <button className={styles.editButton} onClick={() => onEdit(workflowId)}>
          Modifier
        </button>
        <button className={styles.deleteButton} onClick={handleDelete}>
          Supprimer
        </button>
      </div>
    </div>
  );
}
