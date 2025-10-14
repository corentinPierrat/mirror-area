import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
} from "reactflow";
import axios from "axios";
import "reactflow/dist/style.css";
import styles from '../styles/Cr-area.module.css';

const API_URL = "http://10.18.207.83:8080";

function WorkflowNode({ data, onParamsChange }) {
  const { title, description, params, payload_schema, type, id, service } = data;
  const [editing, setEditing] = useState(false);
  const [localParams, setLocalParams] = useState(params || {});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (editing && payload_schema) {
      const fetchDynamicOptions = async () => {
        setIsLoadingOptions(true);
        const newOptions = {};
        for (const [key, param] of Object.entries(payload_schema)) {
          if (param.source) {
            try {
              const response = await axios.get(`${API_URL}/services/${param.source}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              newOptions[key] = response.data;
            } catch (error) {
              console.error(`Erreur lors du chargement des options pour ${key}:`, error);
              newOptions[key] = [];
            }
          }
        }
        setDynamicOptions(newOptions);
        setIsLoadingOptions(false);
      };
      fetchDynamicOptions();
    }
  }, [editing, payload_schema, token, service]);

  const handleChange = (key, value) => setLocalParams(prev => ({ ...prev, [key]: value }));
  const handleSave = () => {
    onParamsChange(id, localParams);
    setEditing(false);
  };

  const renderParamsForm = () => {
    if (!payload_schema || !editing) return null;
    if (isLoadingOptions) {
        return <div style={{color: '#fff', padding: '10px'}}>Chargement...</div>;
    }
    return (
      <div className={styles.paramsFormContainer}>
        {Object.entries(payload_schema).map(([key, param]) => {
          const options = dynamicOptions[key] || param.options;
          return (
            <div key={key} className={styles.paramItem}>
              <label>{param.label}:</label>
              {options ? (
                <select value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} className={styles.input}>
                  <option value="">Sélectionne...</option>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={param.type === "number" ? "number" : "text"} value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} className={styles.input} />
              )}
            </div>
          );
        })}
        <button onClick={handleSave} className={styles.saveButton}>Enregistrer</button>
        <button onClick={() => setEditing(false)} className={styles.cancelButton}>Annuler</button>
      </div>
    );
  };

  return (
    <div className={`${styles.nodeBase} ${type === "action" ? styles.nodeAction : styles.nodeReaction}`}>
      <Handle type="target" position="top" />
      <strong>{title}</strong>
      <div className={styles.nodeDescription}>{description}</div>
      {payload_schema && Object.keys(payload_schema).length > 0 && (
        <button onClick={() => setEditing(!editing)} className={styles.editParamsBtn}>
          {editing ? "Fermer" : (Object.values(params).some(v => v) ? "Modifier" : "Définir les paramètres")}
        </button>
      )}
      {renderParamsForm()}
      <Handle type="source" position="bottom" />
    </div>
  );
};

function ParamEditorModal({ schema, initialParams, nodeId, onClose, onSave }) {
  const [localParams, setLocalParams] = useState(initialParams || {});

  useEffect(() => { setLocalParams(initialParams || {}); }, [initialParams]);

  const handleChange = (key, value) => {
    setLocalParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(nodeId, localParams);
  };

  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Éditer les Paramètres</h3>
        <div className={styles.modalScrollable}>
          {Object.entries(schema).map(([key, param]) => (
            <div key={key} style={{ marginTop: 15 }}>
              <label className={styles.modalLabel}>
                {param.label}{param.required && <span style={{ color: '#ff6b6b' }}> *</span>} :
              </label>
              {param.options ? (
                <select value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} className={styles.input}>
                  <option value="">Sélectionne...</option>
                  {param.options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              ) : (
                <input type={param.type === "number" ? "number" : "text"} value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} className={styles.input} />
              )}
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>Annuler</button>
          <button onClick={handleSave} className={styles.saveButton}>Enregistrer</button>
        </div>
      </div>
    </div>
  );

  const portalRoot = document.getElementById('modal-root') || document.body;
  return ReactDOM.createPortal(modalContent, portalRoot);
}

export default function CrArea() {
  const token = localStorage.getItem("userToken");
  const [actions, setActions] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [connectedServices, setConnectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [menuType, setMenuType] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const menuRef = useRef();

  const handleOpenEditModal = useCallback((id, schema, params) => setEditingNode({ id, schema, params }), []);
  const handleCloseEditModal = useCallback(() => setEditingNode(null), []);
  
  const handleParamSave = useCallback((nodeId, newParams) => {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, params: newParams } } : n));
    handleCloseEditModal();
  }, [setNodes, handleCloseEditModal]);

  const nodeTypes = useMemo(() => ({
    workflowNode: (props) => (
      <WorkflowNode {...props} onParamsChange={(id, newParams) => {
        setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, params: newParams } } : node));
      }} />
    ),
  }), [setNodes]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [actionsRes, reactionsRes, servicesListRes] = await Promise.all([
          axios.get(`${API_URL}/catalog/actions`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/catalog/reactions`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/oauth/services`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setActions(Object.values(actionsRes.data || {}).flat());
        setReactions(Object.values(reactionsRes.data || {}).flat());

        const serviceProviders = servicesListRes.data.services.map(s => s.provider);

        const statusPromises = serviceProviders.map(provider =>
          axios.get(`${API_URL}/oauth/${provider}/status`, { headers: { Authorization: `Bearer ${token}` } })
        );
        const statusResults = await Promise.allSettled(statusPromises);
        
        const connected = [];
        statusResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.data.logged_in === true) {
            connected.push(serviceProviders[index]);
          }
        });
        setConnectedServices(connected);

      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchInitialData();
    else setIsLoading(false);
  }, [token]);
  
  const addNode = useCallback((type, item) => {
    const newNodeId = `${type}-${Date.now()}`;
    const newNode = {
      id: newNodeId, type: "workflowNode",
      position: { x: type === "action" ? 100 : 500, y: 100 + (nodes.length % 5) * 100 },
      data: { id: newNodeId, title: item.title, description: item.description, service: item.service, event: item.event, type, payload_schema: item.payload_schema || null, params: {} },
    };
    setNodes((prev) => [...prev, newNode]);
    setMenuType(null);
  }, [nodes.length, setNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const handleCreateWorkflow = async () => {
    if (!workflowName) return alert("Donne un nom à ton workflow !");
    if (edges.length === 0) return alert("Relie au moins une action à une réaction !");
    const linkedNodes = nodes.filter((n) => edges.some((e) => e.source === n.id || e.target === n.id));
    const steps = linkedNodes.map((n) => ({ type: n.data.type, service: n.data.service, event: n.data.event, params: n.data.params || {} }));
    const payload = { name: workflowName, description: "Workflow créé depuis ReactFlow", visibility: "private", steps };
    try {
      await axios.post(`${API_URL}/workflows/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Workflow créé !");
      setEdges([]); setNodes([]); setWorkflowName("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du workflow");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuType(null); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupItemsByService = (items) => items.reduce((acc, item) => {
      const service = item.service || 'autre';
      if (!acc[service]) { acc[service] = []; }
      acc[service].push(item);
      return acc;
  }, {});

  const menuItems = menuType === "action" ? actions : reactions;
  const groupedMenuItems = groupItemsByService(menuItems);

  return (
    <div className={styles.pageContainer}>
      {editingNode && <ParamEditorModal schema={editingNode.schema} initialParams={editingNode.params} nodeId={editingNode.id} onClose={handleCloseEditModal} onSave={handleParamSave} />}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Blueprint AREA</h2>
          <input type="text" placeholder="Nom du workflow" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className={styles.workflowInput} />
        </div>
        <div className={styles.headerRight} ref={menuRef}>
          <button onClick={() => setMenuType("action")} className={styles.btn}>Actions</button>
          <button onClick={() => setMenuType("reaction")} className={styles.btn}>Réactions</button>
          <button onClick={() => alert("Fonction de vérification")} className={`${styles.btn} ${styles.btnCheck}`}>Vérifier</button>
          <button onClick={handleCreateWorkflow} className={`${styles.btn} ${styles.btnSubmit}`}>Envoyer</button>
          {menuType && (
            <div className={styles.menuContainer}>
              {isLoading ? ( <div className={styles.menuMessage}>Chargement...</div> ) : 
              Object.keys(groupedMenuItems).length > 0 ? (
                Object.entries(groupedMenuItems).map(([service, items]) => {
                  const isConnected = connectedServices.includes(service);
                  return (
                    <div key={service} className={styles.serviceGroup}>
                      <strong className={styles.serviceHeader}>{service.charAt(0).toUpperCase() + service.slice(1)}</strong>
                      {items.map((item, i) => (
                        <div key={`${item.event}-${i}`} onClick={() => isConnected ? addNode(menuType, item) : alert(`Veuillez vous connecter à ${service}`)}
                          className={`${styles.menuItem} ${!isConnected && styles.menuItemDisabled}`}>
                          <strong>{item.title}</strong>
                          <div className={styles.menuItemDescription}>{item.description}</div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : ( <div className={styles.menuMessage}>Aucun élément disponible.</div> )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.flowContainer}>
        <ReactFlowProvider>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
            <MiniMap />
            <Controls />
            <Background color="#fff" gap={20} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}