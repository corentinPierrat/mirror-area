import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Cr-area.module.css";

const API_URL = "http://10.18.207.151:8080";

export default function Crarea() {
  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

  const [reactions, setReactions] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);

  const [workflowName, setWorkflowName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchActions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Token manquant");

      const res = await axios.get(`${API_URL}/catalog/actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allActions = Object.values(res.data || {}).flat();
      setActions(allActions);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les actions");
    } finally {
      setLoading(false);
    }
  };

  const fetchReactions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Token manquant");

      const res = await axios.get(`${API_URL}/catalog/reactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allReactions = Object.values(res.data || {}).flat();
      setReactions(allReactions);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les réactions");
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    if (!workflowName || !selectedAction || !selectedReaction) {
      return alert("Veuillez entrer un nom et sélectionner une action et une réaction");
    }

    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Token manquant");

      const payload = {
        name: workflowName,
        description: "Workflow créé via le web",
        visibility: "private",
        steps: [
          {
            type: "action",
            service: selectedAction?.service || "unknown",
            event: selectedAction?.event || "unknown",
            params: selectedAction?.params || {},
          },
          {
            type: "reaction",
            service: selectedReaction?.service || "unknown",
            event: selectedReaction?.event || "unknown",
            params: selectedReaction?.params || {},
          },
        ],
      };

      const res = await axios.post(`${API_URL}/workflows/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Workflow créé avec succès !");
      console.log(res.data);
      setSelectedAction(null);
      setSelectedReaction(null);
      setWorkflowName("");
    } catch (err) {
      console.error(err);
      alert("Impossible de créer le workflow");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.workflowSection}>
        <h2>Nom du Workflow</h2>
        <input
          type="text"
          placeholder="Entrez le nom"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.workflowSection}>
        <h2>Actions</h2>
        <button onClick={fetchActions} disabled={loading}>
          {loading ? "Chargement..." : "Charger les actions"}
        </button>
        {actions.length > 0 && (
          <ul className={styles.list}>
            {actions.map((action, index) => (
              <li
                key={action.id || index}
                onClick={() => setSelectedAction(action)}
                className={
                  selectedAction === action ? styles.selectedItem : ""
                }
              >
                <strong>{action.title || action.name}</strong>
                <p>{action.description || "Pas de description"}</p>
              </li>
            ))}
          </ul>
        )}
        {selectedAction && (
          <p>
            ✅ Action sélectionnée :{" "}
            <strong>{selectedAction.title || selectedAction.name}</strong>
          </p>
        )}
      </div>

      <div className={styles.workflowSection}>
        <h2>Réactions</h2>
        <button onClick={fetchReactions} disabled={loading}>
          {loading ? "Chargement..." : "Charger les réactions"}
        </button>
        {reactions.length > 0 && (
          <ul className={styles.list}>
            {reactions.map((reaction, index) => (
              <li
                key={reaction.id || index}
                onClick={() => setSelectedReaction(reaction)}
                className={
                  selectedReaction === reaction ? styles.selectedItem : ""
                }
              >
                <strong>{reaction.title || reaction.name}</strong>
                <p>{reaction.description || "Pas de description"}</p>
              </li>
            ))}
          </ul>
        )}
        {selectedReaction && (
          <p>
            ✅ Réaction sélectionnée :{" "}
            <strong>{selectedReaction.title || selectedReaction.name}</strong>
          </p>
        )}
      </div>

      <button onClick={createWorkflow} className={styles.createButton}>
        Créer Workflow
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
