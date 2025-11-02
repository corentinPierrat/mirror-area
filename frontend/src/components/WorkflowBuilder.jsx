import React, { useState } from "react";
import "./styles.css";

function WorkflowBuilder() {
  const [action, setAction] = useState("");
  const [reaction, setReaction] = useState("");

  const handleCreate = () => {
    console.log("Workflow created:", { action, reaction });
    alert("Saved in console log");
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Create a Workflow</h2>

        <label>Select an Action</label>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="Faceit">Faceit</option>
          <option value="Steam">Steam</option>
          <option value="Discord">Discord</option>
          <option value="Outlook">Outlook</option>
          <option value="X (Twitter)">X (Twitter)</option>
          <option value="Spotify">Spotify</option>
        </select>

        <label>Select a Reaction</label>
        <select value={reaction} onChange={(e) => setReaction(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="Email">Send email</option>
          <option value="Discord">Send Discord message</option>
          <option value="X">Send tweet</option>
          <option value="Playlist">Start a playlist</option>
        </select>

        <button className="btn" onClick={handleCreate}>
          Create Workflow
        </button>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
