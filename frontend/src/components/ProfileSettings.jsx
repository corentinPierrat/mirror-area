import React, { useState } from "react";
import "./styles.css";

function ProfileSettings() {
  const [email, setEmail] = useState("user@gmail.com");
  const [username, setUsername] = useState("pseudo96");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    console.log("Updated profile:", { email, username, password });
    alert("profil changes saved in console log");
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>My Profile</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}

export default ProfileSettings;
