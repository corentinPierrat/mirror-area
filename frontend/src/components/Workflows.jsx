import React from "react";
import styles from "../styles/Workflows.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function Workflows({ Name, Action, Reactions = [], workflowId, onDelete }) {
  const navigate = useNavigate();

  console.log("Workflow reçu :", { Name, Action, Reactions, workflowId });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Unauthenticated user");

      await axios.delete(`${API_URL}/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Workflow deleted!");
      if (onDelete) onDelete(workflowId);
    } catch (err) {
      console.error(err);
      alert("Unable to delete workflow");
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
          : "No reaction"}
      </p>
      <div className={styles.buttonContainer}>
        <button
          className={styles.editButton}
          onClick={() =>
            navigate(`/edit/${workflowId}`, {
              state: {
                workflow: { Name, Action, Reactions, workflowId }
              }
            })
          }
        >
          Modifier
        </button>
        <button className={styles.deleteButton} onClick={handleDelete}>
          Supprimer
        </button>
      </div>
    </div>
  );
}
