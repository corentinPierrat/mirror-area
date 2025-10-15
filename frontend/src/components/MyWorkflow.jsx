import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/MyWorkflows.module.css";
import Workflows from "./Workflows";
import EditWorkflowModal from './EditWorkflow';

const API_URL = import.meta.env.VITE_API_URL;
export default function MyWorkflow() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [editingWorkflowId, setEditingWorkflowId] = useState(null);

  const getWorkflows = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Unauthenticated user.");

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
      console.error("Error retrieving workflows:", err);
      setError(err.message || "Unable to load workflows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWorkflows();
  }, []);

  const handleEdit = (id) => {
    console.log("Attempting to edit with ID:", id);
    setEditingWorkflowId(id);
  };

  const handleCloseModal = () => {
    setEditingWorkflowId(null);
  };

  const handleSave = () => {
    setEditingWorkflowId(null);
    getWorkflows();
  };

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
                : "Action unknow"
            }
            Reactions={workflow.reactions || []} 
            onDelete={(id) =>
              setWorkflows((prev) => prev.filter((w) => w.id !== id))
            }
            onEdit={handleEdit} 
          />
        ))}
      </div>
    ) : (
      <p className={styles.noWorkflows}>No workflow available.</p>
    )}

    {editingWorkflowId && (
      <EditWorkflowModal
        workflowId={editingWorkflowId}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    )}
  </div>
);
}