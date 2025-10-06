import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Cr-area.module.css";

const API_URL = "http://10.18.207.151:8080";

export default function Crarea() {
  const [actions, setActions] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("userToken");
        if (!token) throw new Error("Token manquant");

        const headers = { Authorization: `Bearer ${token}` };

        const [actionsRes, reactionsRes] = await Promise.all([
          axios.get(`${API_URL}/catalog/actions`, { headers }),
          axios.get(`${API_URL}/catalog/reactions`, { headers })
        ]);

        const actionsKeys = Object.keys(actionsRes.data || {});
        const actionsData = actionsKeys.length > 0 ? actionsRes.data[actionsKeys[0]] : [];
        setActions(Array.isArray(actionsData) ? actionsData : [actionsData]);

        const reactionsKeys = Object.keys(reactionsRes.data || {});
        const reactionsData = reactionsKeys.length > 0 ? reactionsRes.data[reactionsKeys[0]] : [];
        setReactions(Array.isArray(reactionsData) ? reactionsData : [reactionsData]);

      } catch (err) {
        console.error("Erreur fetch catalog:", err);
        setError("Impossible de charger les données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className={styles.loading}>Chargement...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Catalogue Actions & Reactions</h1>

      <section className={styles.listSection}>
        <h2>Actions</h2>
        {actions.length === 0 ? (
          <p>Aucune action disponible</p>
        ) : (
          <ul className={styles.list}>
            {actions.map((action, index) => (
              <li key={action.id || index}>{action.title || action.name || index}</li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.listSection}>
        <h2>Reactions</h2>
        {reactions.length === 0 ? (
          <p>Aucune réaction disponible</p>
        ) : (
          <ul className={styles.list}>
            {reactions.map((reaction, index) => (
              <li key={reaction.id || index}>{reaction.title || reaction.name || index}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
