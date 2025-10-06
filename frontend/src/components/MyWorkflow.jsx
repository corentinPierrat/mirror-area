import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/MyWorkflows.module.css";
import Workflows from "./Workflows";
const API_URL = "http://10.18.207.151:8080";

export default function MyWorkflow() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getWorkflows = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/workflows/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWorkflows(response.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des workflows :", err);
      setError("Impossible de charger les workflows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWorkflows();
  }, []);

  if (loading) return <p className={styles.loading}>Chargement...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mes Workflows</h1>

      {workflows.length > 0 ? (
        <div className={styles.workflowList}>
          {workflows.map((workflow) => (
            <Workflows
              key={workflow.id}
              Name={workflow.name}
              Action={workflow.action || "Action inconnue"}
              Reaction={workflow.reaction || "Reaction inconnue"}
            />
          ))}
        </div>
      ) : (
        <p className={styles.noWorkflows}>Aucun workflow disponible.</p>
      )}
    </div>
  );
}
