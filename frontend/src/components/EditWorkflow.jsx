import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/EditWorkflow.module.css'; 

const API_URL = import.meta.env.VITE_API_URL;
export default function EditWorkflowModal({ workflowId, onClose, onSave }) {
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!workflowId) return;
    const fetchWorkflowDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/workflows/${workflowId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkflowData(res.data);
      } catch (error) {
        console.error("Unable to load workflow details", error);
        onClose();
      }
      setLoading(false);
    };
    fetchWorkflowDetails();
  }, [workflowId, token, onClose]);

  const handleParamChange = (stepIndex, paramKey, value) => {
    const updatedSteps = [...workflowData.steps];
    updatedSteps[stepIndex].params[paramKey] = value;
    setWorkflowData({ ...workflowData, steps: updatedSteps });
  };

  const handleNameChange = (e) => {
    setWorkflowData({ ...workflowData, name: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`${API_URL}/workflows/${workflowId}`, {
        name: workflowData.name,
        steps: workflowData.steps,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Workflow updated!");
      onSave();
    } catch (error) {
      console.error("Error during update", error);
      alert("The update failed.");
    }
  };

  if (loading || !workflowData) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edit Workflow</h2>
        <div className={styles.formGroup}>
          <label>Workflow Name</label>
          <input type="text" value={workflowData.name} onChange={handleNameChange} className={styles.input} />
        </div>
        {workflowData.steps.map((step, index) => (
          <div key={index} className={styles.stepContainer}>
            <h3>{step.type === 'action' ? 'Action' : 'Reaction'}: {step.event}</h3>
            {Object.keys(step.params || {}).length > 0 ? (
              Object.keys(step.params).map((paramKey) => (
                <div key={paramKey} className={styles.formGroup}>
                  <label>{paramKey}</label>
                  <input type="text" value={step.params[paramKey]} onChange={(e) => handleParamChange(index, paramKey, e.target.value)} className={styles.input} />
                </div>
              ))
            ) : <p className={styles.noParams}>This module has no configurable parameters.</p>}
          </div>
        ))}
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button onClick={handleSaveChanges} className={styles.saveButton}>Save</button>
        </div>
      </div>
    </div>
  );
}
