import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./styles/Feeds.module.css";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import HeaderDashboard from "./components/HeaderDashboard";

const API_URL = import.meta.env.VITE_API_URL;

function PublicWorkflowCard({ workflow, onClone }) {
  const [action, setAction] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { name, steps, author, profile_picture, description } = workflow;

  useEffect(() => {
    const actionStep = steps?.find((s) => s.type === "action");
    const reactionSteps = steps?.filter((s) => s.type === "reaction");
    setAction(actionStep);
    setReactions(reactionSteps || []);
  }, [steps]);

  const avatarUrl = profile_picture
    ? `${API_URL}${profile_picture}`
    : `https://api.dicebear.com/7.x/identicon/svg?seed=${author || 'default'}`;

  const renderServiceTag = (service, event, key) => (
    <div className={styles.serviceTag} key={key}>
      <img
        src={`/${service}.png`}
        alt={service}
        className={styles.serviceLogo}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <span className={styles.eventName}>{event}</span>
    </div>
  );

  const handleCloneClick = async () => {
    setIsLoading(true);
    await onClone(workflow);
    setIsLoading(false);
  };

  return (
    <div className={styles.workflowCard}>
      <div className={styles.workflowOwner}>
        <img src={avatarUrl} alt={author} className={styles.ownerAvatar} />
        <span className={styles.ownerName}>{author || 'Unknown Creator'}</span>
      </div>

      <h3 className={styles.workflowName}>{name}</h3>

      {description && (
        <p className={styles.workflowDescription}>{description}</p>
      )}

      <div className={styles.workflowContent}>
        <div className={styles.section}>
          {action ? (
            renderServiceTag(action.service, action.event, "action")
          ) : (
            <span>No Action</span>
          )}
        </div>
        <div className={styles.arrowLogo}>
          <DoubleArrowIcon sx={{ transform: "rotate(90deg)", color: "#fff" }} />
        </div>
        <div className={styles.section}>
          {reactions.length > 0 ? (
            reactions.map((r, i) =>
              renderServiceTag(r.service, r.event, `reaction-${i}`)
            )
          ) : (
            <span>No Reactions</span>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button
          onClick={handleCloneClick}
          className={styles.cloneButton}
          disabled={isLoading}
        >
          {isLoading ? 'Copying...' : 'Add to My Account'}
        </button>
      </div>
    </div>
  );
}

export default function Feed() {
  const [workflows, setWorkflows] = useState([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("userToken");

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/feed/workflows`, {
        ...getAuthHeaders(),
        params: {
          limit: 100,
        },
      });

      if (Array.isArray(res.data)) {
        setWorkflows(res.data);
        setFilteredWorkflows(res.data);
      } else {
        console.error("API response is not an array:", res.data);
        setWorkflows([]);
        setFilteredWorkflows([]);
      }
    } catch (err) {
      console.error("Error loading feed workflows:", err);
      setError("Could not load public workflows.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleCloneWorkflow = async (workflowToClone) => {
    if (!token) return alert("You must be logged in to copy a workflow.");
    if (!workflowToClone || !workflowToClone.steps) {
      console.error("Workflow data is incomplete:", workflowToClone);
      alert("Error: Cannot copy incomplete workflow.");
      return;
    }

    const payload = {
      name: `Copy of ${workflowToClone.name}`,
      description: workflowToClone.description || "Copied from public feed",
      visibility: "private",
      steps: workflowToClone.steps,
    };

    console.log("Attempting to clone workflow with payload:", payload);

    try {
      await axios.post(`${API_URL}/workflows/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Workflow copied to your account!");
    } catch (err) {
      console.error("Error cloning workflow:", err.response?.data || err);
      alert(`Error: ${err.response?.data?.detail || 'Could not copy workflow.'}`);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }
    fetchWorkflows();
  }, [token, fetchWorkflows]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setServiceFilter(serviceInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [serviceInput]);

  useEffect(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedService = serviceFilter.trim().toLowerCase();

    const results = workflows.filter((wf) => {
      const matchesName = wf.name.toLowerCase().includes(normalizedSearch);
      const matchesService =
        !normalizedService ||
        wf.steps?.some((step) =>
          step?.service?.toLowerCase().includes(normalizedService)
        );
      return matchesName && matchesService;
    });

    setFilteredWorkflows(results);
  }, [searchTerm, serviceFilter, workflows]);

  const renderContent = () => {
    if (loading) {
      return <p className={styles.message}>Loading workflows...</p>;
    }
    if (error) {
      return <p className={styles.message}>{error}</p>;
    }
    if (filteredWorkflows.length === 0) {
      return <p className={styles.message}>No public workflows found.</p>;
    }
    return (
      <div className={styles.workflowGrid}>
        {filteredWorkflows.map((wf) => (
          <PublicWorkflowCard
            key={wf.id}
            workflow={wf}
            onClone={handleCloneWorkflow}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <video
              className={styles.videoBackground}
              src="/bg-video.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
      <aside className={styles.sidebar}>
        <HeaderDashboard />
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.feedHeader}>
          <h1>Public Feed</h1>
          <p>Discover workflows created by the community.</p>
        </header>

        <div className={styles.filterBar}>
          <input
            type="text"
            placeholder="Search by name..."
            className={styles.filterInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by service (e.g., discord)"
            className={styles.filterInput}
            value={serviceInput}
            onChange={(e) => setServiceInput(e.target.value)}
          />
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
