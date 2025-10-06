import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Cr-area.module.css";

const API_URL = "http://10.18.207.151:8080";

export default function Crarea() {
  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

  const [reactions, setReactions] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);

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

      const keys = Object.keys(res.data || {});
      const data = keys.length > 0 ? res.data[keys[0]] : [];
      setActions(Array.isArray(data) ? data : [data]);
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

      const keys = Object.keys(res.data || {});
      const data = keys.length > 0 ? res.data[keys[0]] : [];
      setReactions(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les réactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAction = (action) => {
    setSelectedAction(action);
    setActions([]);
  };

  const handleSelectReaction = (reaction) => {
    setSelectedReaction(reaction);
    setReactions([]);
  };

  const createWorkflow = async () => {
    if (!selectedAction || !selectedReaction) {
      return alert("Veuillez sélectionner une action et une réaction");
    }

    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Token manquant");

      const payload = {
        name: "Mon Workflow",
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
    } catch (err) {
      console.error(err);
      alert("Impossible de créer le workflow");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.workflowSection}>
        <h2>Actions</h2>
        <button onClick={fetchActions} disabled={loading}>
          {loading ? "Chargement..." : "Sélectionner une action"}
        </button>
        {actions.length > 0 && (
          <ul className={styles.list}>
            {actions.map((action, index) => (
              <li key={action.id || index} onClick={() => handleSelectAction(action)}>
                <strong>{action.title || action.name}</strong>
                <p>{action.description || "Pas de description"}</p>
              </li>
            ))}
          </ul>
        )}
        {selectedAction && <p>Action sélectionnée: {selectedAction.title || selectedAction.name}</p>}
      </div>

      <div className={styles.workflowSection}>
        <h2>Reactions</h2>
        <button onClick={fetchReactions} disabled={loading}>
          {loading ? "Chargement..." : "Sélectionner une réaction"}
        </button>
        {reactions.length > 0 && (
          <ul className={styles.list}>
            {reactions.map((reaction, index) => (
              <li key={reaction.id || index} onClick={() => handleSelectReaction(reaction)}>
                <strong>{reaction.title || reaction.name}</strong>
                <p>{reaction.description || "Pas de description"}</p>
              </li>
            ))}
          </ul>
        )}
        {selectedReaction && <p>Réaction sélectionnée: {selectedReaction.title || selectedReaction.name}</p>}
      </div>

      <button onClick={createWorkflow} className={styles.createButton}>
        Créer Workflow
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
