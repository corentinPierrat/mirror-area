import React, { useState } from "react";
import "./styles.css";

function WorkflowBuilder() {
  const [action, setAction] = useState("");
  const [reaction, setReaction] = useState("");

  const handleCreate = () => {
    console.log("Workflow créé:", { action, reaction });
    alert("saved in console log");
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Créer un Workflow</h2>

        <label>Choisir une Action</label>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">-- Sélectionner --</option>
          <option value="Faceit">Faceit</option>
          <option value="Steam">Steam</option>
          <option value="Discord">Discord</option>
          <option value="Outlook">Outlook</option>
          <option value="X (Twitter)">X (Twitter)</option>
          <option value="Spotify">Spotify</option>
        </select>

        <label>Choisir une Réaction</label>
        <select value={reaction} onChange={(e) => setReaction(e.target.value)}>
          <option value="">-- Sélectionner --</option>
          <option value="Email">envoyaer Email</option>
          <option value="Discord">envoyer message Discord</option>
          <option value="X">envoyer tweet</option>
          <option value="Musique">lancer une playlist</option>
        </select>

        <button className="btn" onClick={handleCreate}>
          Créer le Workflow
        </button>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
