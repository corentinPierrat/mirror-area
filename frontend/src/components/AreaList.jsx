import React, { useEffect, useState } from "react";
import { BASE } from "./test";
import styles from "../styles/AreaList.module.css";

export default function AreaList() {
  const [areas, setAreas] = useState({});
  const [activeAreas, setActiveAreas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAreas(BASE);
    // on initialise toutes les areas comme inactives
    const initialState = Object.keys(BASE).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setActiveAreas(initialState);
    setLoading(false);
  }, []);

  const toggleActive = (key) => {
    setActiveAreas((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) return <p>Chargement des areas...</p>;
  if (!areas || Object.keys(areas).length === 0)
    return <p>Aucune action/réaction trouvée.</p>;

  return (
    <div className={styles["area-list"]}>
      {Object.entries(areas).map(([key, item]) => (
        <div
          className={`${styles["area-card"]} ${
            activeAreas[key] ? styles["active"] : ""
          }`}
          key={key}
        >
          <div className={styles["area-header"]}>
            <h3>{item.title}</h3>
            <button
              className={`${styles["toggle-btn"]} ${
                activeAreas[key] ? styles["on"] : styles["off"]
              }`}
              onClick={() => toggleActive(key)}
            >
              {activeAreas[key] ? "Désactiver" : "Activer"}
            </button>
          </div>

          <p className={styles["area-service"]}>
            Service : <strong>{item.service}</strong>
          </p>
          <p className={styles["area-description"]}>{item.description}</p>

          <div className={styles["area-meta"]}>
            <p>
              <b>Méthode :</b> {item.method}
            </p>
            <p>
              <b>Endpoint :</b> {item.path}
            </p>
          </div>

          {item.payload_schema && (
            <details className={styles["payload-details"]}>
              <summary>Payload attendu</summary>
              <pre>{JSON.stringify(item.payload_schema, null, 2)}</pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
