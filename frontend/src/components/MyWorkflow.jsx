import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/MyWorkflows.module.css";
import Workflows from "./Workflows";

const API_URL = "http://10.18.207.83:8080";

export default function MyWorkflow() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getWorkflows = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Utilisateur non authentifié.");

      const res = await axios.get(`${API_URL}/workflows/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = (res.data || []).map((wf) => {
        const actionStep = wf.steps?.find((s) => s.type === "action") || {};
        const reactionSteps = wf.steps?.filter((s) => s.type === "reaction") || [];

        return {
          ...wf,
          action: actionStep,
          reactions: reactionSteps,
        };
      });

      setWorkflows(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des workflows :", err);
      setError(err.message || "Impossible de charger les workflows.");
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
              workflowId={workflow.id}
              Name={workflow.name}
              Action={
                workflow.action
                  ? `${workflow.action.service} - ${workflow.action.event}`
                  : "Action inconnue"
              }
              Reactions={workflow.reactions || []} 
              onDelete={(id) =>
                setWorkflows((prev) => prev.filter((w) => w.id !== id))
              }
            />
          ))}
        </div>
      ) : (
        <p className={styles.noWorkflows}>Aucun workflow disponible.</p>
      )}
    </div>
  );
}
