import React, { useState } from "react";
import "./styles.css";

function WorkflowsList() {
  const [workflows, setWorkflows] = useState([
    { id: 1, action: "Discord", reaction: "envoyer tweet", active: true },
    { id: 2, action: "Steam", reaction: "lancer une playlist", active: false },
  ]);

  const toggleActive = (id) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === id ? { ...wf, active: !wf.active } : wf
      )
    );
    console.log("Workflow toggled:", id);
  };

  const deleteWorkflow = (id) => {
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
    console.log("Workflow supprimé:", id);
  };

  return (
    <div className="page-container">
      <h2>Mes Workflows</h2>
      {workflows.map((wf) => (
        <div key={wf.id} className="card workflow-card">
          <p>
            <strong>Action:</strong> {wf.action} → <strong>Réaction:</strong>{" "}
            {wf.reaction}
          </p>
          <p>Status: {wf.active ? "✅ Actif" : "❌ Inactif"}</p>
          <button className="btn" onClick={() => toggleActive(wf.id)}>
            {wf.active ? "Désactiver" : "Activer"}
          </button>
          <button
            className="btn delete"
            onClick={() => deleteWorkflow(wf.id)}
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}

export default WorkflowsList;
