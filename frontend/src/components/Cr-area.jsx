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
  Position,
  applyEdgeChanges,
} from "reactflow";
import axios from "axios";
import "reactflow/dist/style.css";
import styles from '../styles/Cr-area.module.css';

const API_URL = import.meta.env.VITE_API_URL;
function WorkflowNode({ data, onParamsChange, onTest }) {
  const {
    title,
    description,
    params = {},
    payload_schema,
    output_schema,
    type,
    id,
    service,
    links = {},
    action_kind = "trigger",
  } = data;
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
              console.error(`Error loading options for ${key}:`, error);
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

  const handleTestClick = () => {
    if (onTest) {
      onTest({
        ...data,
        params: editing ? localParams : (params || {})
      });
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "Aucune valeur";
    if (typeof value === "string") return value;
    try {
      const serialized = JSON.stringify(value);
      return serialized.length > 60 ? `${serialized.slice(0, 57)}...` : serialized;
    } catch (err) {
      return String(value);
    }
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
          const linked = !!links[key];
          return (
            <div key={key} className={styles.paramItem}>
              <label>{param.label}:</label>
              {linked && (
                <div className={styles.linkedHint}>
                  Relié à {links[key].sourceTitle || "une action"} — cette valeur sera utilisée comme secours.
                </div>
              )}
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

  const renderReactionInputs = () => {
    if (type !== "reaction" || !payload_schema || Object.keys(payload_schema).length === 0) return null;
    return (
      <div className={styles.handleSection}>
        <div className={styles.handleSectionTitle}>Entrées</div>
        {Object.entries(payload_schema).map(([key, param]) => {
          const linkInfo = links[key];
          const manualValue = params[key];
          return (
            <div key={key} className={`${styles.handleRow} ${linkInfo ? styles.handleRowLinked : ""}`}>
              <Handle type="target" position={Position.Left} id={`input-${key}`} />
              <div className={styles.handleContent}>
                <span className={styles.handleLabel}>{param.label || key}</span>
                {linkInfo ? (
                  <span className={styles.handleInfo}>
                    Relié à {linkInfo.sourceTitle || "action"} · {linkInfo.label || linkInfo.field}
                  </span>
                ) : (
                  <span className={styles.handleInfo}>
                    {(manualValue !== undefined && manualValue !== null && manualValue !== "")
                      ? formatValue(manualValue)
                      : "Valeur manuelle requise"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderActionOutputs = () => {
    if (type !== "action" || !output_schema || Object.keys(output_schema).length === 0) return null;
    return (
      <div className={styles.handleSection}>
        <div className={styles.handleSectionTitle}>Sorties</div>
        {Object.entries(output_schema).map(([key, meta]) => (
          <div key={key} className={styles.handleRow}>
            <div className={styles.handleContent}>
              <span className={styles.handleLabel}>{meta.label || key}</span>
              {meta?.path && meta.path !== key && (
                <span className={styles.handleInfo}>chemin: {meta.path}</span>
              )}
            </div>
            <Handle type="source" position={Position.Right} id={`output-${key}`} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${styles.nodeBase} ${type === "action" ? styles.nodeAction : styles.nodeReaction}`}>
      {type === "reaction" && (
        <Handle type="target" position={Position.Top} id="general-in" />
      )}
      {type === "action" && action_kind !== "getter" && (
        <Handle type="source" position={Position.Bottom} id="general-out" />
      )}
      <strong className={styles.nodeTitle}>{title}</strong>
      <div className={styles.nodeDescription}>{description}</div>
      {payload_schema && Object.keys(payload_schema).length > 0 && (
        <button onClick={() => setEditing(!editing)} className={styles.editParamsBtn}>
          {editing ? "Close" : (Object.values(params).some(v => v) ? "Modify" : "Set settings")}
        </button>
      )}
      <button onClick={handleTestClick} className={styles.editParamsBtn}>
        Test
      </button>
      {renderParamsForm()}
      {renderReactionInputs()}
      {renderActionOutputs()}
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
  const [edges, setEdges] = useEdgesState([]);
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

  const handleNodeParamsChange = useCallback((id, newParams) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, params: newParams } } : node));
  }, [setNodes]);

  const handleTestNode = useCallback(async (nodeData) => {
    if (!token) {
      alert("Veuillez vous connecter pour lancer un test.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/workflows/test-step`,
        {
          type: nodeData.type,
          service: nodeData.service,
          event: nodeData.event,
          params: nodeData.params || {}
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { success, result: actionResult, message: infoMessage, error } = response.data;

      const formatValue = (value, fallback = "") => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === "string") return value;
        try {
          return JSON.stringify(value, null, 2);
        } catch (err) {
          console.error("Failed to stringify value", err);
          return fallback || String(value);
        }
      };

      if (nodeData.type === "action") {
        if (success) {
          const message = formatValue(actionResult, "Test réussi (aucune donnée retournée)");
          alert(message);
        } else {
          const failure = infoMessage || error || actionResult;
          alert(`Action échouée: ${formatValue(failure, "Erreur inconnue")}`);
        }
        console.log("Action test result:", response.data);
        return;
      }

      const message = infoMessage || error;
      if (success) {
        alert(message || "Réaction exécutée avec succès.");
      } else {
        alert(message || "Erreur pendant la réaction.");
      }
      console.log("Reaction test result:", response.data);
    } catch (error) {
      const message = error?.response?.data?.detail || error?.response?.data?.error || error.message;
      alert(`Erreur pendant le test: ${message}`);
      console.error("Test error:", error);
    }
  }, [token]);

  const nodeTypes = useMemo(() => ({
    workflowNode: (props) => (
      <WorkflowNode {...props} onParamsChange={handleNodeParamsChange} onTest={handleTestNode} />
    ),
  }), [handleNodeParamsChange, handleTestNode]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [actionsRes, reactionsRes, servicesListRes] = await Promise.all([
          axios.get(`${API_URL}/catalog/actions`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/catalog/reactions`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/oauth/services`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const actionsData = actionsRes.data || {};
        const reactionsData = reactionsRes.data || {};

        setActions(Object.entries(actionsData).map(([key, meta]) => ({ ...meta, catalogKey: key })));
        setReactions(Object.entries(reactionsData).map(([key, meta]) => ({ ...meta, catalogKey: key })));

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
        console.error("Error receiving data:", error);
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
      data: {
        id: newNodeId,
        title: item.title,
        description: item.description,
        service: item.service,
        event: item.event,
        type,
        payload_schema: item.payload_schema || null,
        output_schema: item.output_schema || null,
        action_kind: item.action_kind || "trigger",
        params: {},
        links: {}
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setMenuType(null);
  }, [nodes.length, setNodes]);

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    if (!sourceNode || !targetNode) {
      return;
    }

    const isFieldConnection =
      params.sourceHandle?.startsWith("output-") && params.targetHandle?.startsWith("input-");
    const isGeneralConnection =
      params.sourceHandle === "general-out" && params.targetHandle === "general-in";

    if (!isFieldConnection && !isGeneralConnection) {
      return;
    }

    if (isFieldConnection && (sourceNode.data.type !== "action" || targetNode.data.type !== "reaction")) {
      return;
    }
    if (isGeneralConnection && (sourceNode.data.type !== "action" || sourceNode.data.action_kind === "getter")) {
      return;
    }

    setEdges((eds) => {
      const filtered = eds.filter(
        (edge) => !(edge.target === params.target && edge.targetHandle === params.targetHandle)
      );
      return addEdge({ ...params, animated: true }, filtered);
    });

    if (isFieldConnection) {
      const sourceField = params.sourceHandle.replace("output-", "");
      const targetField = params.targetHandle.replace("input-", "");
      const outputMeta = sourceNode.data.output_schema ? sourceNode.data.output_schema[sourceField] : null;

      setNodes((nds) => nds.map((node) => {
        if (node.id !== targetNode.id) return node;
        const currentLinks = node.data.links || {};
        const updatedLinks = {
          ...currentLinks,
          [targetField]: {
            source: params.source,
            field: sourceField,
            path: outputMeta?.path || sourceField,
            label: outputMeta?.label || sourceField,
            sourceTitle: sourceNode.data.title
          }
        };
        return { ...node, data: { ...node.data, links: updatedLinks } };
      }));
    }
  }, [nodes, setEdges, setNodes]);

  const onEdgesChange = useCallback((changes) => {
    const removedEdges = changes
      .filter((change) => change.type === "remove")
      .map((change) => edges.find((edge) => edge.id === change.id))
      .filter(Boolean);

    if (removedEdges.length > 0) {
      setNodes((nds) => nds.map((node) => {
        let updatedLinks = node.data.links;
        removedEdges.forEach((edge) => {
          if (edge.target === node.id && edge.targetHandle?.startsWith("input-")) {
            const field = edge.targetHandle.replace("input-", "");
            if (updatedLinks && updatedLinks[field]) {
              updatedLinks = { ...updatedLinks };
              delete updatedLinks[field];
            }
          }
        });
        if (updatedLinks !== node.data.links) {
          return { ...node, data: { ...node.data, links: updatedLinks } };
        }
        return node;
      }));
    }

    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [edges, setEdges, setNodes]);

  const handleCreateWorkflow = async () => {
    if (!workflowName) return alert("Give your workflow a name");
    if (edges.length === 0) return alert("Match at least one action to a reaction!");
    const linkedNodes = nodes
      .filter((n) => edges.some((e) => e.source === n.id || e.target === n.id))
      .sort((a, b) => {
        const orderMap = { action: 0, reaction: 1, transformation: 2 };
        const aOrder = orderMap[a.data.type] ?? 99;
        const bOrder = orderMap[b.data.type] ?? 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.id.localeCompare(b.id);
      });
    const steps = linkedNodes.map((n) => ({
      client_id: n.id,
      type: n.data.type,
      service: n.data.service,
      event: n.data.event,
      params: n.data.params || {},
      links: Object.keys(n.data.links || {}).length > 0 ? n.data.links : undefined
    }));
    const payload = { name: workflowName, description: "Workflow created from ReactFlow", visibility: "private", steps };
    try {
      await axios.post(`${API_URL}/workflows/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Workflow created !");
      setEdges([]); setNodes([]); setWorkflowName("");
    } catch (err) {
      console.error(err);
      alert("Error creating workflow");
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
          <input type="text" placeholder="Workflow name" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className={styles.workflowInput} />
        </div>
        <div className={styles.headerRight} ref={menuRef}>
          <button onClick={() => setMenuType("action")} className={styles.btn}>Actions</button>
          <button onClick={() => setMenuType("reaction")} className={styles.btn}>Reactions</button>
          <button onClick={() => alert("Verification function")} className={`${styles.btn} ${styles.btnCheck}`}>Verify</button>
          <button onClick={handleCreateWorkflow} className={`${styles.btn} ${styles.btnSubmit}`}>Send</button>
          {menuType && (
            <div className={styles.menuContainer}>
              {isLoading ? ( <div className={styles.menuMessage}>Loading...</div> ) : 
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
              ) : ( <div className={styles.menuMessage}>No items available.</div> )}
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
