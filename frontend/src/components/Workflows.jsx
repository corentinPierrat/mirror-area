import React, { useState, useEffect } from "react";
import styles from "../styles/Workflows.module.css";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
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
  visibility = "private", 
}) {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(!!active);
  const [isPublic, setIsPublic] = useState(visibility === "public");

  useEffect(() => {
    setIsActive(!!active);
    setIsPublic(visibility === "public");
  }, [active, visibility, workflowId]);

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
      console.error(
        "Unable to toggle workflow",
        err.response?.data || err.message
      );
    }
  };

  const handleToggleVisibility = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    const newVisibility = isPublic ? "private" : "public";

    try {
      const steps = [];
      if (Action && Action.service) {
        steps.push({ ...Action, type: "action" });
      }
      if (Reactions && Reactions.length > 0) {
        Reactions.forEach(r => {
          if (r && r.service) {
            steps.push({ ...r, type: "reaction" });
          }
        });
      }

      const updatedWorkflow = {
        name: Name,
        active: isActive,
        visibility: newVisibility,
        steps: steps,
      };

      console.log("Workflow reconstruct for PUT :", updatedWorkflow);

      const putResponse = await axios.put(
        `${API_URL}/workflows/${workflowId}`,
        updatedWorkflow,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Visibility update :", putResponse.data);
      setIsPublic(newVisibility === "public");
    } catch (err) {
      console.error(
        "Unable to update visibility",
        err.response?.data || err.message
      );
    }
  };

  const renderAction = () => {
    if (!Action) return <span>Aucune action</span>;

    if (typeof Action === "object" && Action.service && Action.event) {
      return (
        <div className={styles.centeredTicTac}>
          <div className={styles.tictac}>
            <img
              src={`/${Action.service}.png`}
              alt={Action.service}
              className={styles.serviceLogo}
              onError={(e) => e.target.style.display = 'none'}
            />
            <span className={styles.eventName}>{Action.event.replace(/_/g, ' ')}</span>
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
      return <span className={styles.noReactionText}>No reaction</span>;

    return (
      <div className={styles.centeredTicTac}>
        {Reactions.map((r, i) => {
          if (r && typeof r === "object" && r.service && r.event) {
            return (
              <div key={i} className={styles.tictac}>
                <img
                  src={`/${r.service}.png`}
                  alt={r.service}
                  className={styles.serviceLogo}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <span className={styles.eventName}>{r.event.replace(/_/g, ' ')}</span>
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
      <div className={styles.headerRow}>
        <button
          className={styles.visibilityButton}
          onClick={handleToggleVisibility}
          title={
            isPublic
              ? "Make the workflow private"
              : "Make the workflow public"
          }
        >
          {isPublic ? (
            <VisibilityIcon sx={{ color: "#fff", fontSize: 20 }} />
          ) : (
            <VisibilityOffIcon sx={{ color: "rgba(255,255,255,0.6)", fontSize: 20 }} />
          )}
        </button>

        <h2 className={styles.workflowName}>{Name}</h2>
      </div>

      <div className={styles.workflowContent}>
        <div className={styles.section}>{renderAction()}</div>
        <div className={styles.arrow_logo}>
          <DoubleArrowIcon sx={{ transform: "rotate(90deg)", color: 'rgba(255, 255, 255, 0.5)' }} />
        </div>
        <div className={styles.section}>{renderReactions()}</div>
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
          Modify
        </button>

        <button className={styles.deleteButton} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

