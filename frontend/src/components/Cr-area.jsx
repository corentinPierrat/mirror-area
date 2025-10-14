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

const API_URL = "http://10.18.207.83:8080";

function WorkflowNode({ data, onParamsChange }) {
  const { title, description, params, payload_schema, type, id } = data;
  const [editing, setEditing] = useState(false);
  const [localParams, setLocalParams] = useState(params || {});

  const handleChange = (key, value) => setLocalParams(prev => ({ ...prev, [key]: value }));
  const handleSave = () => {
    onParamsChange(id, localParams);
    setEditing(false);
  };

  const renderParamsForm = () => {
    if (!payload_schema || !editing) return null;
    return (
      <div style={{ marginTop: 10, textAlign: 'left', padding: '0 10px' }}>
        {Object.entries(payload_schema).map(([key, param]) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11 }}>{param.label}:</label>
            {param.options ? (
              <select value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} style={inputStyle}>
                <option value="">Sélectionne...</option>
                {param.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input type={param.type === "number" ? "number" : "text"} value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} style={inputStyle} />
            )}
          </div>
        ))}
        <button onClick={handleSave} style={saveButtonStyle}>Enregistrer</button>
        <button onClick={() => setEditing(false)} style={cancelButtonStyle}>Annuler</button>
      </div>
    );
  };

  return (
    <div style={{
      padding: 10,
      borderRadius: 8,
      background: type === "action" ? "#2a72a2" : "#2a2a72",
      color: "#fff",
      minWidth: 220,
      textAlign: "center",
      border: "2px solid #fff",
    }}>
      <Handle type="target" position="top" />
      <strong>{title}</strong>
      <div style={{ fontSize: 12, marginBottom: 8 }}>{description}</div>
      
      {payload_schema && Object.keys(payload_schema).length > 0 && (
        <button onClick={() => setEditing(!editing)} style={buttonStyle}>
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
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3>Éditer les Paramètres</h3>
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 10px' }}>
          {Object.entries(schema).map(([key, param]) => (
            <div key={key} style={{ marginTop: 15 }}>
              <label style={{ display: "block", marginBottom: 5 }}>
                {param.label}{param.required && <span style={{ color: '#ff6b6b' }}> *</span>} :
              </label>
              {param.options ? (
                <select value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} style={inputStyle}>
                  <option value="">Sélectionne...</option>
                  {param.options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              ) : (
                <input type={param.type === "number" ? "number" : "text"} value={localParams[key] || ""} onChange={(e) => handleChange(key, e.target.value)} style={inputStyle} />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 25, display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #444', paddingTop: 20 }}>
          <button onClick={onClose} style={cancelButtonStyle}>Annuler</button>
          <button onClick={handleSave} style={saveButtonStyle}>Enregistrer</button>
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
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [menuType, setMenuType] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const menuRef = useRef();

  const handleOpenEditModal = useCallback((id, schema, params) => {
    setEditingNode({ id, schema, params });
  }, []);
  const handleCloseEditModal = useCallback(() => { setEditingNode(null); }, []);
  const handleParamSave = useCallback((nodeId, newParams) => {
    setNodes((prev) =>
      prev.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, params: newParams } } : n)
    );
    handleCloseEditModal();
  }, [setNodes, handleCloseEditModal]);

  const nodeTypes = useMemo(() => ({
    workflowNode: (props) => (
      <WorkflowNode 
        {...props} 
        onParamsChange={(id, newParams) => {
          setNodes((nds) => 
            nds.map((node) => 
              node.id === id 
                ? { ...node, data: { ...node.data, params: newParams } } 
                : node
            )
          );
        }} 
      />
    ),
  }), [setNodes]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [a, r] = await Promise.all([
          axios.get(`${API_URL}/catalog/actions`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/catalog/reactions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setActions(Object.values(a.data || {}).flat());
        setReactions(Object.values(r.data || {}).flat());
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchAll();
    else setIsLoading(false);
  }, [token]);

  const addNode = useCallback((type, item) => {
    const newNodeId = `${type}-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: "workflowNode",
      position: { x: type === "action" ? 100 : 500, y: 100 + (nodes.length % 5) * 100 },
      data: {
        id: newNodeId,
        title: item.title,
        description: item.description,
        service: item.service,
        event: item.event,
        type,
        payload_schema: item.payload_schema || null,
        params: {},
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setMenuType(null);
  }, [nodes.length, setNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const handleCreateWorkflow = async () => {
    if (!workflowName) return alert("Donne un nom à ton workflow !");
    if (edges.length === 0) return alert("Relie au moins une action à une réaction !");
    const linkedNodes = nodes.filter((n) => edges.some((e) => e.source === n.id || e.target === n.id));
    const steps = linkedNodes.map((n) => ({
      type: n.data.type,
      service: n.data.service,
      event: n.data.event,
      params: n.data.params || {},
    }));
    const payload = { name: workflowName, description: "Workflow créé depuis ReactFlow", visibility: "private", steps };
    try {
      await axios.post(`${API_URL}/workflows/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Workflow créé !");
      setEdges([]);
      setNodes([]);
      setWorkflowName("");
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

  const menuItems = menuType === "action" ? actions : reactions;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "85vh", width: "100%" }}>
      {editingNode && (
        <ParamEditorModal
          schema={editingNode.schema}
          initialParams={editingNode.params}
          nodeId={editingNode.id}
          onClose={handleCloseEditModal}
          onSave={handleParamSave}
        />
      )}

      <div style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", margin: "20px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Blueprint AREA</h2>
          <input type="text" placeholder="Nom du workflow" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#2a2a40", color: "#fff", outline: "none" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }} ref={menuRef}>
          <button onClick={() => setMenuType("action")} style={btnStyle}>Actions</button>
          <button onClick={() => setMenuType("reaction")} style={btnStyle}>Réactions</button>
          <button onClick={() => alert("Fonction de vérification") } style={{ ...btnStyle, background: "#007bff" }}>Vérifier</button>
          <button onClick={handleCreateWorkflow} style={{ ...btnStyle, background: "#00c46b" }}>Envoyer</button>

          {menuType && (
            <div style={{ position: "absolute", top: 40, right: 0, background: "#2a2a40", border: "1px solid #444", borderRadius: 6, maxHeight: 300, overflowY: "auto", zIndex: 20, minWidth: 220, padding: 5 }}>
              {isLoading ? (
                <div style={{ padding: 8, color: '#aaa' }}>Chargement...</div>
              ) : menuItems.length > 0 ? (
                menuItems.map((item, i) => (
                  <div
                    key={`${item.event}-${i}`}
                    onClick={() => addNode(menuType, item)}
                    style={menuItemStyle}
                  >
                    <strong>{item.title}</strong>
                    <div style={{ fontSize: 11 }}>{item.description}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 8, color: '#aaa' }}>Aucun élément disponible.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, margin: "0 20px 20px 20px", borderRadius: "12px", overflow: "hidden", background: "linear-gradient(135deg, #171542 0%, #2f339e 100%)" }}>
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

const btnStyle = { background: "#2a72a2", color: "white", padding: "8px 14px", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, transition: "0.2s" };
const buttonStyle = { marginTop: 10, padding: '5px 10px', background: '#007bff', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12 };
const menuItemStyle = { padding: 8, cursor: 'pointer', borderBottom: '1px solid #444', borderRadius: 4, backgroundColor: 'transparent', transition: '0.2s', ':hover': { backgroundColor: '#3a3a6a' } };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: '#1f1f3f', padding: '20px 30px', borderRadius: 8, width: '90%', maxWidth: '500px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)', color: '#fff', border: '1px solid #4a4a8a' };
const inputStyle = { width: "100%", padding: 10, borderRadius: 4, border: "1px solid #555", background: "#2a2a40", color: "#fff", marginTop: 5, boxSizing: 'border-box' };
const saveButtonStyle = { padding: '10px 20px', border: 'none', borderRadius: 4, backgroundColor: '#00c46b', color: 'white', cursor: 'pointer', fontWeight: 'bold' };
const cancelButtonStyle = { padding: '10px 20px', border: '1px solid #777', borderRadius: 4, backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' };