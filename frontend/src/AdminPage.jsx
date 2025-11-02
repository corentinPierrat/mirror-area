import React, { useState, useEffect, useCallback, Fragment } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import styles from "./styles/AdminDashboard.module.css";

const API_URL = import.meta.env.VITE_API_URL;

const formatStatKey = (key) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function EditUserModal({ user, onClose, onSave, token }) {
  const [username, setUsername] = useState(user.username);
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        username: username,
        is_admin: isAdmin,
      };

      const response = await axios.put(
        `${API_URL}/admin/users/${user.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("PUT /admin/users response:", response.data);
      onSave(response.data);
      onClose();
    } catch (err) {
      console.error("Failed to update user:", err);
      const errorMsg = err.response?.data?.detail || "Could not update user.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Edit User: {user.email}</h3>
        <form onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={styles.modalInput}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="isAdmin" className={styles.checkboxLabel}>
              <input
                id="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              Administrator
            </label>
          </div>
          {error && <p className={styles.modalError}>{error}</p>}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalBtnSecondary}
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.modalBtnPrimary}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem("userToken");

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const handleApiError = (err, context) => {
    console.error(`Error loading ${context}:`, err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      setError("Access denied. You must be an administrator.");
    } else {
      setError(`Could not load data (${context}).`);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, getAuthHeaders());
      console.log("DEBUG: Raw data from /admin/stats:", res.data);
      setStats(res.data);
    } catch (err) {
      handleApiError(err, "stats");
    }
    setLoading(false);
  }, [token]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users`, getAuthHeaders());
      setUsers(res.data);
    } catch (err) {
      handleApiError(err, "users");
    }
    setLoading(false);
  }, [token]);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/workflows`, getAuthHeaders());
      setWorkflows(res.data);
    } catch (err) {
      handleApiError(err, "workflows");
    }
    setLoading(false);
  }, [token]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/logs`, getAuthHeaders());
      setLogs(res.data);
    } catch (err) {
      handleApiError(err, "logs");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }
    fetchStats();
  }, [token, fetchStats]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setError("");
    if (tab === "stats" && !stats) fetchStats();
    if (tab === "users" && users.length === 0) fetchUsers();
    if (tab === "workflows" && workflows.length === 0) fetchWorkflows();
    if (tab === "logs" && logs.length === 0) fetchLogs();
  };

  const handleDeleteUser = async (userId) => {
    console.warn(`User deletion request ${userId}`);
    try {
      await axios.delete(
        `${API_URL}/admin/users/${userId}`,
        getAuthHeaders()
      );
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      handleApiError(err, "delete user");
    }
  };

  const handleUpdateUser = () => {
    fetchUsers();
  };

  const handleDeleteWorkflow = async (workflowId) => {
    console.warn(`workflow deletion request ${workflowId}`);
    try {
      await axios.delete(
        `${API_URL}/admin/workflows/${workflowId}`,
        getAuthHeaders()
      );
      setWorkflows(workflows.filter((w) => w.id !== workflowId));
    } catch (err) {
      handleApiError(err, "delete workflow");
    }
  };

  const renderStats = () => {
    if (!stats || Object.keys(stats).length === 0) {
      return <p>No statistics to display.</p>;
    }
    
    return (
      <div className={styles.statGrid}>
        {Object.entries(stats).map(([key, value]) => (
          <div className={styles.statCard} key={key}>
            <h4>{formatStatKey(key)}</h4>
            <p>{value ?? "N/A"}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderUsers = () => (
    <table className={styles.adminTable}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Username</th>
          <th>Admin</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.email}</td>
            <td>{user.username}</td>
            <td>{user.is_admin ? "Yes" : "No"}</td> 
            <td className={styles.actionCell}>
              <button
                className={styles.editBtn}
                onClick={() => {
                  console.log("DEBUG: Edit button clicked. User:", user);
                  setEditingUser(user);
                }}
              >
                Edit
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderWorkflows = () => (
    <table className={styles.adminTable}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Owner (ID)</th>
          <th>Active</th>
          <th>Visibility</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {workflows.map((wf) => (
          <tr key={wf.id}>
            <td>{wf.id}</td>
            <td>{wf.name}</td>
            <td>{wf.owner_id}</td>
            <td>{wf.active ? "Yes" : "No"}</td>
            <td>{wf.visibility}</td>
            <td className={styles.actionCell}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteWorkflow(wf.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderLogs = () => (
    <div className={styles.logContainer}>
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <pre key={index} className={styles.logEntry}>
            {JSON.stringify(log, null, 2)}
          </pre>
        ))
      ) : (
        <p>No logs found.</p>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className={styles.loader}>Loading...</div>;
    
    switch (activeTab) {
      case "stats":
        return stats ? renderStats() : <p>No statistics to display.</p>;
      case "users":
        return users.length > 0 ? renderUsers() : <p>No users found.</p>;
      default:
        return null;
    }
  };

  return (
    <Fragment>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
          token={token}
        />
      )}
      <div className={styles.adminContainer}>
        <aside className={styles.adminSidebar}>
          <h3>Admin Panel</h3>
          <nav>
            <button
              className={activeTab === "stats" ? styles.active : ""}
              onClick={() => handleTabClick("stats")}
            >
              Statistics
            </button>
            <button
              className={activeTab === "users" ? styles.active : ""}
              onClick={() => handleTabClick("users")}
            >
              Users
            </button>
          </nav>
        </aside>

        <main className={styles.adminContent}>
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          {error ? <div className={styles.error}>{error}</div> : renderContent()}
        </main>
      </div>
    </Fragment>
  );
}
