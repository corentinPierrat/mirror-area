import React, { useState, useEffect } from "react";
import styles from "../styles/Workflows.module.css";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function Workflows({
  Name,
  Action,
  Reactions = [],
  workflowId,
  onDelete,
  active,
}) {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(!!active);

  useEffect(() => {
    setIsActive(!!active);
  }, [active, workflowId]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Unauthenticated user");
      await axios.delete(`${API_URL}/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDelete) onDelete(workflowId);
    } catch (err) {
      console.error("Unable to delete workflow", err);
    }
  };

  const handleToggle = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    try {
      const response = await axios.patch(
        `${API_URL}/workflows/${workflowId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsActive(response.data.active);
    } catch (err) {
      console.error("Unable to toggle workflow", err.response?.data || err.message);
    }
  };

  const renderAction = () => {
    if (!Action) return <span>Aucune action</span>;

    if (typeof Action === "object" && Action.service && Action.event) {
      return (
        <div className={styles.centeredTicTac}>
          <div className={styles.tictac}>
            <img
              src={`../public/${Action.service}.png`}
              alt={Action.service}
              className={styles.serviceLogo}
            />
            <span className={styles.eventName}>{Action.event}</span>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.centeredTicTac}>
        <div className={styles.tictac}>
          <span className={styles.eventName}>{String(Action)}</span>
        </div>
      </div>
    );
  };

  const renderReactions = () => {
    if (!Reactions || Reactions.length === 0)
      return <span>Aucune réaction</span>;

    return (
      <div className={styles.centeredTicTac}>
        {Reactions.map((r, i) => {
          if (r && typeof r === "object" && r.service && r.event) {
            return (
              <div key={i} className={styles.tictac}>
                <img
                  src={`../public/${r.service}.png`}
                  alt={r.service}
                  className={styles.serviceLogo}
                />
                <span className={styles.eventName}>{r.event}</span>
              </div>
            );
          }
          return (
            <div key={i} className={styles.tictac}>
              <span className={styles.eventName}>{String(r)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.workflowCard}>
      <h2 className={styles.workflowName}>{Name}</h2>

      <div className={styles.workflowContent}>
        <div className={styles.section}>
          {renderAction()}
        </div>
        <div className={styles.arrow_logo}>
        <DoubleArrowIcon sx={{ transform: 'rotate(90deg)' }} />
        </div>
        <div className={styles.section}>
          {renderReactions()}
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <label className={styles.toggleSwitch}>
          <input type="checkbox" checked={isActive} onChange={handleToggle} />
          <span className={styles.slider}></span>
        </label>

        <button
          className={styles.editButton}
          onClick={() =>
            navigate(`/edit/${workflowId}`, {
              state: {
                workflow: { Name, Action, Reactions, workflowId, active: isActive },
              },
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
