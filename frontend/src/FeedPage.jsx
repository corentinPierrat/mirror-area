import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import videoBg from "../public/bg-video.mp4";
import styles from "./styles/Feeds.module.css";
import Header from "./components/Header";
import HeaderDashboard from "./components/HeaderDashboard";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";

const API_URL = import.meta.env.VITE_API_URL;

function PublicWorkflowCard({ workflow }) {
  const [action, setAction] = useState(null);
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    const actionStep = workflow.steps?.find((s) => s.type === "action");
    const reactionSteps = workflow.steps?.filter((s) => s.type === "reaction");
    setAction(actionStep);
    setReactions(reactionSteps || []);
  }, [workflow]);

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

  return (
    <div className={styles.workflowCard}>
      <h3 className={styles.workflowName}>{workflow.name}</h3>
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
      const params = {
        limit: 100,
      };
      if (serviceFilter) {
        params.service = serviceFilter;
      }

      const res = await axios.get(`${API_URL}/feed/workflows`, {
        ...getAuthHeaders(),
        params,
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
  }, [token, serviceFilter]);

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
    const results = workflows.filter((wf) =>
      wf.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkflows(results);
  }, [searchTerm, workflows]);

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
          <PublicWorkflowCard key={wf.id} workflow={wf} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <video
              className={styles.videoBackground}
              src={videoBg}
              autoPlay
              loop
              muted
              playsInline
            />
      <aside className={styles.sidebar}>
        <HeaderDashboard />
      </aside>

      <main className={styles.mainContent}>
        <div style={{ width: '0%' }}>
          <Header />
        </div>
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

