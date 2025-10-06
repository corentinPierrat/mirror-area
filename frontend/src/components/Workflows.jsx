import React from "react";
import styles from "../styles/Workflows.module.css";

export default function Workflows({ Name, Action, Reaction }) {
  return (
    <div className={styles.workflowCard}>
      <h2 className={styles.workflowName}>{Name}</h2>
      <p><strong>Action :</strong> {Action}</p>
      <p><strong>Reaction :</strong> {Reaction}</p>
    </div>
  );
}
